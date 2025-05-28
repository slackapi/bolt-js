import crypto from 'node:crypto';
import querystring from 'node:querystring';
import type { ExecutionContext } from '@cloudflare/workers-types';
import { ConsoleLogger, LogLevel, type Logger } from '@slack/logger';
import type App from '../App';
import { ReceiverMultipleAckError } from '../errors';
import type { Receiver, ReceiverEvent } from '../types/receiver';
import type { StringIndexed } from '../types/utilities';

function bufferEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) {
    return false;
  }
  if (crypto.timingSafeEqual) {
    return crypto.timingSafeEqual(a, b);
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function timeSafeCompare(a: string | number, b: string | number) {
  const sa = String(a);
  const sb = String(b);
  const randomBytes = new Uint8Array(32);

  // Fill the array with cryptographically secure random values
  const key = crypto.getRandomValues(randomBytes);
  const ah = crypto.createHmac('sha256', key).update(sa).digest();
  const bh = crypto.createHmac('sha256', key).update(sb).digest();

  return bufferEqual(ah, bh) && a === b;
}

export interface ReceiverInvalidRequestSignatureHandlerArgs {
  rawBody: string;
  signature: string;
  ts: number;
  request: Request;
  response: Promise<Response>;
}

export interface CloudflareWorkerReceiverOptions {
  /**
   * The Slack Signing secret to be used as an input to signature verification to ensure that requests are coming from
   * Slack.
   *
   * If the {@link signatureVerification} flag is set to `false`, this can be set to any value as signature verification
   * using this secret will not be performed.
   *
   * @see {@link https://api.slack.com/authentication/verifying-requests-from-slack#about} for details about signing secrets
   */
  signingSecret: string;
  /**
   * The {@link Logger} for the receiver
   *
   * @default ConsoleLogger
   */
  logger?: Logger;
  /**
   * The {@link LogLevel} to be used for the logger.
   *
   * @default LogLevel.INFO
   */
  logLevel?: LogLevel;
  /**
   * Flag that determines whether Bolt should {@link https://api.slack.com/authentication/verifying-requests-from-slack|verify Slack's signature on incoming requests}.
   *
   * @default true
   */
  signatureVerification?: boolean;
  /**
   * Optional `function` that can extract custom properties from an incoming receiver event
   * @param request The API Gateway event {@link Request}
   * @returns An object containing custom properties
   *
   * @default noop
   */
  customPropertiesExtractor?: (request: Request) => StringIndexed;
  invalidRequestSignatureHandler?: (args: ReceiverInvalidRequestSignatureHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
  processBeforeResponse?: boolean;
}

/*
 * Receiver implementation for Cloudflare Workers
 */
export default class CloudflareWorkerReceiver implements Receiver {
  private signingSecret: string;

  private app?: App;

  private _logger: Logger;

  get logger() {
    return this._logger;
  }

  private signatureVerification: boolean;

  private customPropertiesExtractor: (request: Request) => StringIndexed;

  private invalidRequestSignatureHandler: (args: ReceiverInvalidRequestSignatureHandlerArgs) => void;

  private unhandledRequestTimeoutMillis: number;

  private processBeforeResponse: boolean;

  public constructor({
    signingSecret,
    logger = undefined,
    logLevel = LogLevel.INFO,
    signatureVerification = true,
    customPropertiesExtractor = (_) => ({}),
    invalidRequestSignatureHandler,
    unhandledRequestTimeoutMillis = 3001,
    processBeforeResponse = false,
  }: CloudflareWorkerReceiverOptions) {
    // Initialize instance variables, substituting defaults for each value
    this.signingSecret = signingSecret;
    this.signatureVerification = signatureVerification;
    this.unhandledRequestTimeoutMillis = unhandledRequestTimeoutMillis;
    this.processBeforeResponse = processBeforeResponse;
    this._logger =
      logger ??
      (() => {
        const defaultLogger = new ConsoleLogger();
        defaultLogger.setLevel(logLevel);
        return defaultLogger;
      })();
    this.customPropertiesExtractor = customPropertiesExtractor;
    if (invalidRequestSignatureHandler) {
      this.invalidRequestSignatureHandler = invalidRequestSignatureHandler;
    } else {
      this.invalidRequestSignatureHandler = this.defaultInvalidRequestSignatureHandler;
    }
  }

  public init(app: App): void {
    this.app = app;
  }

  // biome-ignore lint/suspicious/noExplicitAny: TODO: what should the REceiver interface here be? probably needs work
  public start(..._args: any[]): Promise<ReturnType<typeof this.toHandler>> {
    return new Promise((resolve, reject) => {
      try {
        const handler = this.toHandler();
        resolve(handler);
      } catch (error) {
        reject(error);
      }
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: TODO: what should the REceiver interface here be? probably needs work
  public stop(..._args: any[]): Promise<void> {
    return new Promise((resolve, _reject) => {
      resolve();
    });
  }

  public toHandler() {
    return async (request: Request, _env: unknown, ctx: ExecutionContext): Promise<Response> => {
      this.logger.debug(`Cloudflare request: ${JSON.stringify(request, null, 2)}`);

      const rawBody = await request.text();

      // biome-ignore lint/suspicious/noExplicitAny: request bodies can be anything
      const body: any = this.parseRequestBody(rawBody, request.headers.get('Content-Type') ?? undefined, this.logger);

      // ssl_check (for Slash Commands)
      if (
        typeof body !== 'undefined' &&
        body != null &&
        typeof body.ssl_check !== 'undefined' &&
        body.ssl_check != null
      ) {
        return Promise.resolve(new Response(null, { status: 200 }));
      }

      if (this.signatureVerification) {
        // request signature verification
        const signature = request.headers.get('X-Slack-Signature') as string;
        const ts = Number(request.headers.get('X-Slack-Request-Timestamp'));
        if (!this.isValidRequestSignature(this.signingSecret, rawBody, signature, ts)) {
          const response = Promise.resolve(new Response(null, { status: 401 }));
          this.invalidRequestSignatureHandler({
            rawBody,
            signature,
            ts,
            request,
            response,
          });
          return response;
        }
      }

      // url_verification (Events API)
      if (
        typeof body !== 'undefined' &&
        body != null &&
        typeof body.type !== 'undefined' &&
        body.type != null &&
        body.type === 'url_verification'
      ) {
        return Promise.resolve(
          new Response(JSON.stringify({ challenge: body.challenge }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      // Setup ack timeout warning
      let isAcknowledged = false;
      const noAckTimeoutId = setTimeout(() => {
        if (!isAcknowledged) {
          this.logger.error(
            `An incoming event was not acknowledged within ${this.unhandledRequestTimeoutMillis} ms. Ensure that the ack() argument is called in a listener.`,
          );
        }
      }, this.unhandledRequestTimeoutMillis);

      let ackResolve: (() => void) | undefined;
      const ackPromise = new Promise<void>((resolve) => {
        ackResolve = resolve;
      });

      // Structure the ReceiverEvent
      // biome-ignore lint/suspicious/noExplicitAny: request responses can be anything
      let storedResponse: any;
      const retryNum = request.headers.get('X-Slack-Retry-Num');
      const retryReason = request.headers.get('X-Slack-Retry-Reason');
      const event: ReceiverEvent = {
        body,
        ack: async (response) => {
          if (isAcknowledged) {
            throw new ReceiverMultipleAckError();
          }
          isAcknowledged = true;
          clearTimeout(noAckTimeoutId);
          if (typeof response === 'undefined' || response == null) {
            storedResponse = '';
          } else {
            storedResponse = response;
          }
          if (!this.processBeforeResponse) {
            ackResolve?.();
          }
        },
        retryNum: retryNum ? Number(retryNum) : undefined,
        retryReason: retryReason ?? undefined,
        customProperties: this.customPropertiesExtractor(request),
      };

      // Send the event to the app for processing
      try {
        if (this.processBeforeResponse) {
          await this.app?.processEvent(event);
        } else {
          const processEventPromise = this.app?.processEvent(event);
          await Promise.race([processEventPromise, ackPromise]);
          if (processEventPromise) {
            ctx.waitUntil(processEventPromise);
          }
        }

        if (storedResponse !== undefined) {
          if (typeof storedResponse === 'string') {
            return new Response(storedResponse);
          }
          return new Response(JSON.stringify(storedResponse));
        }
      } catch (err) {
        this.logger.error('An unhandled error occurred while Bolt processed an event');
        this.logger.debug(`Error details: ${err}, storedResponse: ${storedResponse}`);
        return new Response('Internal server error', { status: 500 });
      }
      // No matching handler; clear ack warning timeout and return a 404.
      clearTimeout(noAckTimeoutId);
      this.logger.info(`No request handler matched the request: ${request.url}`);
      return new Response('', { status: 404 });
    };
  }

  private parseRequestBody(
    stringBody: string,
    contentType: string | undefined,
    logger: Logger,
    // biome-ignore lint/suspicious/noExplicitAny: request bodies can be anything
  ): any {
    if (contentType === 'application/x-www-form-urlencoded') {
      const parsedBody = querystring.parse(stringBody);
      if (typeof parsedBody.payload === 'string') {
        return JSON.parse(parsedBody.payload);
      }
      return parsedBody;
    }
    if (contentType === 'application/json') {
      return JSON.parse(stringBody);
    }

    logger.warn(`Unexpected content-type detected: ${contentType}`);
    try {
      // Parse this body anyway
      return JSON.parse(stringBody);
    } catch (e) {
      logger.error(`Failed to parse body as JSON data for content-type: ${contentType}`);
      throw e;
    }
  }

  private isValidRequestSignature(
    signingSecret: string,
    body: string,
    signature: string,
    requestTimestamp: number,
  ): boolean {
    if (!signature || !requestTimestamp) {
      return false;
    }
    // Divide current date to match Slack ts format
    // Subtract 5 minutes from current time
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
    if (requestTimestamp < fiveMinutesAgo) {
      return false;
    }

    const hmac = crypto.createHmac('sha256', signingSecret);
    const [version, hash] = signature.split('=');
    hmac.update(`${version}:${requestTimestamp}:${body}`);
    const computedHash = hmac.digest('hex');

    if (!timeSafeCompare(hash, computedHash)) {
      return false;
    }

    return true;
  }

  private defaultInvalidRequestSignatureHandler(args: ReceiverInvalidRequestSignatureHandlerArgs): void {
    const { signature, ts } = args;

    this.logger.info(
      `Invalid request signature detected (X-Slack-Signature: ${signature}, X-Slack-Request-Timestamp: ${ts})`,
    );
  }
}
