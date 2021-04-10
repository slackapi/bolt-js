import type { Request, Response } from 'express';
import type { Logger } from '@slack/logger';
import { ConsoleLogger, LogLevel } from '@slack/logger';
import crypto from 'crypto';
import querystring from 'querystring';
import tsscmp from 'tsscmp';
import App from '../App';
import { Receiver, ReceiverEvent } from '../types';
import { ReceiverMultipleAckError } from '../errors';

export interface GCPFunctionReceiverOptions {
  signingSecret: string | (() => string | PromiseLike<string>);
  logger?: Logger;
  logLevel?: LogLevel;
}

/*
 * Receiver implementation for Google Cloud Functions w/ Http Triggers
 *
 * Note that this receiver does not support Slack OAuth flow.
 * For OAuth flow endpoints, deploy another Lambda function built with ExpressReceiver.
 */
export default class GCPFunctionReceiver implements Receiver {
  private app?: App;

  public readonly logger: Logger;

  private readonly signingSecret: GCPFunctionReceiverOptions['signingSecret'];

  constructor({ signingSecret, logger = undefined, logLevel = LogLevel.INFO }: GCPFunctionReceiverOptions) {
    this.signingSecret = signingSecret;
    this.logger =
      logger ??
      (() => {
        const defaultLogger = new ConsoleLogger();
        defaultLogger.setLevel(logLevel);
        return defaultLogger;
      })();
  }

  public init(app: App) {
    this.app = app;
  }

  public async start() {
    return Promise.resolve(this.toHandler());
  }

  // eslint-disable-next-line class-methods-use-this
  public async stop() {
    return Promise.resolve();
  }

  public toHandler() {
    return async (request: Request, response: Response) => {
      if (!hasRawBody(request)) {
        throw new Error('GCPFunction interface missing Request.rawBody');
      }

      this.logger.debug(
        'incoming:',
        JSON.stringify({
          body: request.body as unknown,
          headers: request.headers,
        }),
      );

      const rawBody = String(request.rawBody);
      const body = parseRequestBody(rawBody, request.headers['content-type'], this.logger);

      // ssl_check (for Slash Commands)
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (body.ssl_check) {
        response.send('');
        return;
      }

      // request signature verification
      const signingSecret = typeof this.signingSecret === 'string' ? this.signingSecret : await this.signingSecret();
      if (
        !isSignatureValid(
          signingSecret,
          rawBody,
          request.headers['x-slack-signature'],
          request.headers['x-slack-request-timestamp'],
          this.logger,
        )
      ) {
        response.status(401).send('');
        return;
      }

      // url_verification (Events API)
      if (body.type === 'url_verification') {
        response.json({ challenge: body.challenge });
        return;
      }

      // Setup ack timeout warning
      const timeoutId = setTimeout(() => {
        this.logger.error(
          'An incoming event was not acknowledged within 3 seconds. ' +
            'Ensure that the ack() argument is called in a listener.',
        );
      }, 3001);

      // Structure the ReceiverEvent
      let isAcknowledged = false;
      let storedResponse: unknown;
      const event: ReceiverEvent = {
        ack: async (ackResponse) => {
          if (isAcknowledged) {
            throw new ReceiverMultipleAckError();
          }
          isAcknowledged = true;
          clearTimeout(timeoutId);
          if (typeof ackResponse === 'undefined' || ackResponse === null) {
            storedResponse = '';
          } else {
            storedResponse = ackResponse;
          }
          return Promise.resolve();
        },
        body,
      };

      // Send the event to the app for processing
      try {
        await this.app?.processEvent(event);
        if (storedResponse !== undefined) {
          if (typeof storedResponse === 'string') {
            response.send(storedResponse);
            return;
          }
          response.json(storedResponse);
          return;
        }
      } catch (err) {
        this.logger.error('An unhandled error occurred while Bolt processed an event');
        this.logger.debug(`Error details: ${String(err)}, storedResponse: ${String(storedResponse)}`);
        response.status(500).send('Internal server error');
        return;
      }
      response.status(404).send('');
    };
  }
}

export function parseRequestBody(stringBody: string, contentType: string | undefined | string[], logger: Logger) {
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(stringBody);

    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload) as Record<string, unknown>;
    }

    return parsedBody;
  }

  try {
    return JSON.parse(stringBody) as Record<string, unknown>;
  } catch (e) {
    logger.warn('Unable to parse body');
    return {};
  }
}

function hasRawBody(request: Request): request is Request & { rawBody: Buffer } {
  return ((request as unknown) as { rawBody: unknown }).rawBody instanceof Buffer;
}

export function isSignatureValid(
  signingSecret: string,
  body: string,
  signature: unknown,
  requestTimestamp: unknown,
  logger: Logger,
) {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!signature || !requestTimestamp) {
    logger.warn('request signing verification failed. Some headers are missing.');
    return false;
  }

  const ts = Number(requestTimestamp);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(ts)) {
    logger.warn('request signing verification failed. Timestamp is invalid.');
    return false;
  }

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;

  if (ts < fiveMinutesAgo) {
    logger.warn('request signing verification failed. Timestamp is too old.');
    return false;
  }

  const hmac = crypto.createHmac('sha256', signingSecret);
  const [version, hash] = String(signature).split('=');
  hmac.update(`${version}:${ts}:${body}`);

  if (!tsscmp(hash, hmac.digest('hex'))) {
    logger.warn('request signing verification failed. Signature mismatch.');
    return false;
  }
  return true;
}
