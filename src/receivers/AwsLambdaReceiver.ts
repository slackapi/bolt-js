import crypto from 'node:crypto';
import querystring from 'node:querystring';
import { ConsoleLogger, LogLevel, type Logger } from '@slack/logger';
import tsscmp from 'tsscmp';
import type App from '../App';
import { ReceiverMultipleAckError } from '../errors';
import type { Receiver, ReceiverEvent } from '../types/receiver';
import type { StringIndexed } from '../types/utilities';

export type AwsEvent = AwsEventV1 | AwsEventV2;
type AwsEventStringParameters = Record<string, string | undefined>;
type AwsEventMultiValueStringParameters = Record<string, string[] | undefined>;
export interface AwsEventV1 {
  // properties shared w/ v2:
  body: string | null;
  headers: AwsEventStringParameters;
  isBase64Encoded: boolean;
  pathParameters: AwsEventStringParameters | null;
  queryStringParameters: AwsEventStringParameters | null;
  // biome-ignore lint/suspicious/noExplicitAny: request contexts can be anything
  requestContext: any;
  stageVariables: AwsEventStringParameters | null;
  // v1-only properties:
  httpMethod: string;
  multiValueHeaders: AwsEventMultiValueStringParameters;
  multiValueQueryStringParameters: AwsEventMultiValueStringParameters;
  path: string;
  resource: string;
}
export interface AwsEventV2 {
  // properties shared w/ v1:
  body?: string;
  headers: AwsEventStringParameters;
  isBase64Encoded: boolean;
  pathParameters?: AwsEventStringParameters;
  queryStringParameters?: AwsEventStringParameters;
  // biome-ignore lint/suspicious/noExplicitAny: request contexts can be anything
  requestContext: any;
  stageVariables?: AwsEventStringParameters;
  // v2-only properties:
  cookies?: string[];
  rawPath: string;
  rawQueryString: string;
  routeKey: string;
  version: string;
}

// biome-ignore lint/suspicious/noExplicitAny: userland function results can be anything
export type AwsCallback = (error?: Error | string | null, result?: any) => void;

export interface ReceiverInvalidRequestSignatureHandlerArgs {
  rawBody: string;
  signature: string;
  ts: number;
  awsEvent: AwsEvent;
  awsResponse: Promise<AwsResponse>;
}

export interface AwsResponse {
  statusCode: number;
  headers?: {
    [header: string]: boolean | number | string;
  };
  multiValueHeaders?: {
    [header: string]: Array<boolean | number | string>;
  };
  body: string;
  isBase64Encoded?: boolean;
}

// biome-ignore lint/suspicious/noExplicitAny: request context can be anything
export type AwsHandler = (event: AwsEvent, context: any, callback: AwsCallback) => Promise<AwsResponse>;

export interface AwsLambdaReceiverOptions {
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
   * @param request The API Gateway event {@link AwsEvent}
   * @returns An object containing custom properties
   *
   * @default noop
   */
  customPropertiesExtractor?: (request: AwsEvent) => StringIndexed;
  invalidRequestSignatureHandler?: (args: ReceiverInvalidRequestSignatureHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
}

/*
 * Receiver implementation for AWS API Gateway + Lambda apps
 *
 * Note that this receiver does not support Slack OAuth flow.
 * For OAuth flow endpoints, deploy another Lambda function built with ExpressReceiver.
 */
export default class AwsLambdaReceiver implements Receiver {
  private signingSecret: string;

  private app?: App;

  private _logger: Logger;

  get logger() {
    return this._logger;
  }

  private signatureVerification: boolean;

  private customPropertiesExtractor: (request: AwsEvent) => StringIndexed;

  private invalidRequestSignatureHandler: (args: ReceiverInvalidRequestSignatureHandlerArgs) => void;

  private unhandledRequestTimeoutMillis: number;

  public constructor({
    signingSecret,
    logger = undefined,
    logLevel = LogLevel.INFO,
    signatureVerification = true,
    customPropertiesExtractor = (_) => ({}),
    invalidRequestSignatureHandler,
    unhandledRequestTimeoutMillis = 3001,
  }: AwsLambdaReceiverOptions) {
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

  // biome-ignore lint/suspicious/noExplicitAny: TODO: what should the REceiver interface here be? probably needs work
  public start(..._args: any[]): Promise<AwsHandler> {
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

  public toHandler(): AwsHandler {
    // biome-ignore lint/suspicious/noExplicitAny: request context can be anything
    return async (awsEvent: AwsEvent, _awsContext: any, _awsCallback: AwsCallback): Promise<AwsResponse> => {
      this.logger.debug(`AWS event: ${JSON.stringify(awsEvent, null, 2)}`);

      const rawBody = this.getRawBody(awsEvent);

      // biome-ignore lint/suspicious/noExplicitAny: request bodies can be anything
      const body: any = this.parseRequestBody(
        rawBody,
        this.getHeaderValue(awsEvent.headers, 'Content-Type'),
        this.logger,
      );

      // ssl_check (for Slash Commands)
      if (
        typeof body !== 'undefined' &&
        body != null &&
        typeof body.ssl_check !== 'undefined' &&
        body.ssl_check != null
      ) {
        return Promise.resolve({ statusCode: 200, body: '' });
      }

      if (this.signatureVerification) {
        // request signature verification
        const signature = this.getHeaderValue(awsEvent.headers, 'X-Slack-Signature') as string;
        const ts = Number(this.getHeaderValue(awsEvent.headers, 'X-Slack-Request-Timestamp'));
        if (!this.isValidRequestSignature(this.signingSecret, rawBody, signature, ts)) {
          const awsResponse = Promise.resolve({ statusCode: 401, body: '' });
          this.invalidRequestSignatureHandler({ rawBody, signature, ts, awsEvent, awsResponse });
          return awsResponse;
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
        return Promise.resolve({
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challenge: body.challenge }),
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
        retryNum: this.getHeaderValue(awsEvent.headers, 'X-Slack-Retry-Num') as number | undefined,
        retryReason: this.getHeaderValue(awsEvent.headers, 'X-Slack-Retry-Reason'),
        customProperties: this.customPropertiesExtractor(awsEvent),
      };

      // Send the event to the app for processing
      try {
        await this.app?.processEvent(event);
        if (storedResponse !== undefined) {
          if (typeof storedResponse === 'string') {
            return { statusCode: 200, body: storedResponse };
          }
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(storedResponse),
          };
        }
      } catch (err) {
        this.logger.error('An unhandled error occurred while Bolt processed an event');
        this.logger.debug(`Error details: ${err}, storedResponse: ${storedResponse}`);
        return { statusCode: 500, body: 'Internal server error' };
      }
      // No matching handler; clear ack warning timeout and return a 404.
      clearTimeout(noAckTimeoutId);
      let path: string;
      if ('path' in awsEvent) {
        path = awsEvent.path;
      } else {
        path = awsEvent.rawPath;
      }
      this.logger.info(`No request handler matched the request: ${path}`);
      return { statusCode: 404, body: '' };
    };
  }

  private getRawBody(awsEvent: AwsEvent): string {
    if (typeof awsEvent.body === 'undefined' || awsEvent.body == null) {
      return '';
    }
    if (awsEvent.isBase64Encoded) {
      return Buffer.from(awsEvent.body, 'base64').toString('ascii');
    }
    return awsEvent.body;
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

  private getHeaderValue(headers: AwsEvent['headers'], key: string): string | undefined {
    const caseInsensitiveKey = Object.keys(headers).find((it) => key.toLowerCase() === it.toLowerCase());
    return caseInsensitiveKey !== undefined ? headers[caseInsensitiveKey] : undefined;
  }

  private defaultInvalidRequestSignatureHandler(args: ReceiverInvalidRequestSignatureHandlerArgs): void {
    const { signature, ts } = args;

    this.logger.info(
      `Invalid request signature detected (X-Slack-Signature: ${signature}, X-Slack-Request-Timestamp: ${ts})`,
    );
  }
}
