import crypto from 'node:crypto';
import querystring from 'node:querystring';
import { ConsoleLogger, LogLevel, type Logger } from '@slack/logger';
import tsscmp from 'tsscmp';
import type App from '../App';
import { ReceiverMultipleAckError } from '../errors';
import type { Receiver, ReceiverEvent } from '../types/receiver';
import type { StringIndexed } from '../types/utilities';

interface CloudflareWorkerReceiverInvalidRequestSignatureHandlerArgs {
  rawBody: string;
  signature: string;
  ts: number;
  request: Request;
  response: Promise<Response>;
}

type CloudflareWorkerHandler = (request: Request, env: unknown, context: unknown) => Promise<Response>;

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
   * @param request The incoming request
   * @returns An object containing custom properties
   *
   * @default noop
   */
  customPropertiesExtractor?: (request: Request) => StringIndexed;
  invalidRequestSignatureHandler?: (args: CloudflareWorkerReceiverInvalidRequestSignatureHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
}

/*
 * Receiver implementation for Cloudflare Workers apps
 *
 * Note that this receiver does not support Slack OAuth flow.
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

  private invalidRequestSignatureHandler: (args: CloudflareWorkerReceiverInvalidRequestSignatureHandlerArgs) => void;

  private unhandledRequestTimeoutMillis: number;

  public constructor({
    signingSecret,
    logger = undefined,
    logLevel = LogLevel.INFO,
    signatureVerification = true,
    customPropertiesExtractor = (_) => ({}),
    invalidRequestSignatureHandler,
    unhandledRequestTimeoutMillis = 3001,
  }: CloudflareWorkerReceiverOptions) {
    // Initialize instance variables, substituting defaults for each value
    this.signingSecret = signingSecret;
    this.signatureVerification = signatureVerification;
    this.unhandledRequestTimeoutMillis = unhandledRequestTimeoutMillis;
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

  // biome-ignore lint/suspicious/noExplicitAny: different runtimes may pass different handler args
  public start(..._args: any[]): Promise<CloudflareWorkerHandler> {
    return Promise.resolve(this.toHandler());
  }

  // biome-ignore lint/suspicious/noExplicitAny: different runtimes may pass different handler args
  public stop(..._args: any[]): Promise<void> {
    return Promise.resolve();
  }

  public toHandler(): CloudflareWorkerHandler {
    return async (request: Request, _env: unknown, _context: unknown): Promise<Response> => {
      this.logger.debug(`Cloudflare Worker request: ${request.method} ${request.url}`);

      const rawBody = await this.getRawBody(request);

      // biome-ignore lint/suspicious/noExplicitAny: request bodies can be anything
      const body: any = this.parseRequestBody(rawBody, request.headers.get('content-type') ?? undefined, this.logger);

      // ssl_check (for Slash Commands)
      if (
        typeof body !== 'undefined' &&
        body != null &&
        typeof body.ssl_check !== 'undefined' &&
        body.ssl_check != null
      ) {
        return new Response('', { status: 200 });
      }

      if (this.signatureVerification) {
        // request signature verification
        const signature = this.getHeaderValue(request.headers, 'X-Slack-Signature') as string;
        const ts = Number(this.getHeaderValue(request.headers, 'X-Slack-Request-Timestamp'));
        if (!this.isValidRequestSignature(this.signingSecret, rawBody, signature, ts)) {
          const workerResponse = Promise.resolve(new Response('', { status: 401 }));
          this.invalidRequestSignatureHandler({ rawBody, signature, ts, request, response: workerResponse });
          return workerResponse;
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
        return new Response(JSON.stringify({ challenge: body.challenge }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
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

      // Structure the ReceiverEvent
      // biome-ignore lint/suspicious/noExplicitAny: request responses can be anything
      let storedResponse: any;
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
        },
        retryNum: this.getRetryNum(request.headers),
        retryReason: this.getHeaderValue(request.headers, 'X-Slack-Retry-Reason'),
        customProperties: this.customPropertiesExtractor(request),
      };

      // Send the event to the app for processing
      try {
        await this.app?.processEvent(event);
        if (storedResponse !== undefined) {
          if (typeof storedResponse === 'string') {
            return new Response(storedResponse, { status: 200 });
          }
          return new Response(JSON.stringify(storedResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (err) {
        this.logger.error('An unhandled error occurred while Bolt processed an event');
        this.logger.debug(`Error details: ${err}, storedResponse: ${storedResponse}`);
        return new Response('Internal server error', { status: 500 });
      }
      // No matching handler; clear ack warning timeout and return a 404.
      clearTimeout(noAckTimeoutId);
      const path = new URL(request.url).pathname;
      this.logger.info(`No request handler matched the request: ${path}`);
      return new Response('', { status: 404 });
    };
  }

  private async getRawBody(request: Request): Promise<string> {
    if (request.body === null) {
      return '';
    }
    return request.text();
  }

  // biome-ignore lint/suspicious/noExplicitAny: request bodies can be anything
  private parseRequestBody(stringBody: string, contentType: string | undefined, logger: Logger): any {
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
    if (!tsscmp(hash, hmac.digest('hex'))) {
      return false;
    }

    return true;
  }

  private getHeaderValue(headers: Headers, key: string): string | undefined {
    return headers.get(key) ?? undefined;
  }

  private getRetryNum(headers: Headers): number | undefined {
    const retryNum = this.getHeaderValue(headers, 'X-Slack-Retry-Num');
    if (typeof retryNum === 'undefined') {
      return undefined;
    }
    return Number(retryNum);
  }

  private defaultInvalidRequestSignatureHandler(
    args: CloudflareWorkerReceiverInvalidRequestSignatureHandlerArgs,
  ): void {
    const { signature, ts } = args;

    this.logger.info(
      `Invalid request signature detected (X-Slack-Signature: ${signature}, X-Slack-Request-Timestamp: ${ts})`,
    );
  }
}
