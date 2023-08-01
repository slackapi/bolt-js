/* eslint-disable @typescript-eslint/no-explicit-any */
import querystring from 'querystring';
import crypto from 'crypto';
import { Logger, ConsoleLogger, LogLevel } from '@slack/logger';
import tsscmp from 'tsscmp';
import App from '../App';
import { Receiver, ReceiverEvent } from '../types/receiver';
import { ReceiverMultipleAckError } from '../errors';
import { StringIndexed } from '../types/helpers';

export interface AwsEvent {
  body: string | null;
  headers: any;
  multiValueHeaders: any;
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: any | null;
  queryStringParameters: any | null;
  multiValueQueryStringParameters: any | null;
  stageVariables: any | null;
  requestContext: any;
  resource: string;
}

export type AwsCallback = (error?: Error | string | null, result?: any) => void;

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

export type AwsHandler = (event: AwsEvent, context: any, callback: AwsCallback) => Promise<AwsResponse>;

export interface AwsLambdaReceiverOptions {
  signingSecret: string;
  logger?: Logger;
  logLevel?: LogLevel;
  customPropertiesExtractor?: (request: AwsEvent) => StringIndexed;
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

  private logger: Logger;

  private customPropertiesExtractor: (request: AwsEvent) => StringIndexed;

  public constructor({
    signingSecret,
    logger = undefined,
    logLevel = LogLevel.INFO,
    customPropertiesExtractor = (_) => ({}),
  }: AwsLambdaReceiverOptions) {
    // Initialize instance variables, substituting defaults for each value
    this.signingSecret = signingSecret;
    this.logger = logger ??
      (() => {
        const defaultLogger = new ConsoleLogger();
        defaultLogger.setLevel(logLevel);
        return defaultLogger;
      })();
    this.customPropertiesExtractor = customPropertiesExtractor;
  }

  public init(app: App): void {
    this.app = app;
  }

  public start(
    ..._args: any[]
  ): Promise<AwsHandler> {
    return new Promise((resolve, reject) => {
      try {
        const handler = this.toHandler();
        resolve(handler);
      } catch (error) {
        reject(error);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public stop(
    ..._args: any[]
  ): Promise<void> {
    return new Promise((resolve, _reject) => {
      resolve();
    });
  }

  public toHandler(): AwsHandler {
    return async (
      awsEvent: AwsEvent,
      _awsContext: any,
      _awsCallback: AwsCallback,
    ): Promise<AwsResponse> => {
      this.logger.debug(`AWS event: ${JSON.stringify(awsEvent, null, 2)}`);

      const rawBody = this.getRawBody(awsEvent);

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

      // request signature verification
      const signature = this.getHeaderValue(awsEvent.headers, 'X-Slack-Signature') as string;
      const ts = Number(this.getHeaderValue(awsEvent.headers, 'X-Slack-Request-Timestamp'));
      if (!this.isValidRequestSignature(this.signingSecret, rawBody, signature, ts)) {
        this.logger.info(`Invalid request signature detected (X-Slack-Signature: ${signature}, X-Slack-Request-Timestamp: ${ts})`);
        return Promise.resolve({ statusCode: 401, body: '' });
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
            'An incoming event was not acknowledged within 3 seconds. ' +
              'Ensure that the ack() argument is called in a listener.',
          );
        }
      }, 3001);

      // Structure the ReceiverEvent
      let storedResponse;
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
      this.logger.info(`No request handler matched the request: ${awsEvent.path}`);
      return { statusCode: 404, body: '' };
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private getRawBody(awsEvent: AwsEvent): string {
    if (typeof awsEvent.body === 'undefined' || awsEvent.body == null) {
      return '';
    }
    if (awsEvent.isBase64Encoded) {
      return Buffer.from(awsEvent.body, 'base64').toString('ascii');
    }
    return awsEvent.body;
  }

  // eslint-disable-next-line class-methods-use-this
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

  // eslint-disable-next-line class-methods-use-this
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

  // eslint-disable-next-line class-methods-use-this
  private getHeaderValue(headers: Record<string, any>, key: string): string | undefined {
    const caseInsensitiveKey = Object.keys(headers).find((it) => key.toLowerCase() === it.toLowerCase());
    return caseInsensitiveKey !== undefined ? headers[caseInsensitiveKey] : undefined;
  }
}
