/* eslint-disable @typescript-eslint/explicit-member-accessibility, @typescript-eslint/strict-boolean-expressions */

import { ConsoleLogger, Logger, LogLevel } from '@slack/logger';
import { Request, RequestHandler, Response } from 'express';
import rawBody from 'raw-body';
import crypto from 'crypto';
import tsscmp from 'tsscmp';
import querystring from 'querystring';
import { AnyMiddlewareArgs, ReceiverEvent } from '../types';
import { ReceiverAuthenticityError, ReceiverMultipleAckError } from '../errors';
import App from '../App';

export interface ExpressMiddlewareOptions {
  signingSecret: string | (() => PromiseLike<string>);
  logger?: Logger;
  logLevel?: LogLevel;
  processBeforeResponse?: boolean
}

export default class ExpressMiddleware {
  private bolt: App | undefined;

  private readonly logger: Logger;

  private readonly processBeforeResponse: boolean;

  private readonly middleware: RequestHandler[];

  constructor({
                signingSecret = '',
                logger = undefined,
                logLevel = LogLevel.INFO,
                processBeforeResponse = false
              }: ExpressMiddlewareOptions) {
    if (typeof logger !== 'undefined') {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger();
      this.logger.setLevel(logLevel);
    }

    this.processBeforeResponse = processBeforeResponse;

    this.middleware = [
      verifySignatureAndParseRawBody(this.logger, signingSecret),
      respondToSslCheck,
      respondToUrlVerification,
      this.requestHandler.bind(this),
    ];
  }

  public getMiddleware(): RequestHandler[] {
    return this.middleware;
  }

  public init(bolt: App) {
    this.bolt = bolt;
  }

  private async requestHandler(req: Request, res: Response): Promise<void> {
    let isAcknowledged = false;
    setTimeout(() => {
      if (!isAcknowledged) {
        this.logger.error(
          'An incoming event was not acknowledged within 3 seconds. Ensure that the ack() argument is called in a listener.',
        );
      }
      // tslint:disable-next-line: align
    }, 3001);

    let storedResponse;
    const event: ReceiverEvent = {
      body: req.body,
      ack: async (response): Promise<void> => {
        this.logger.debug('ack() begin');
        if (isAcknowledged) {
          throw new ReceiverMultipleAckError();
        }
        isAcknowledged = true;
        if (this.processBeforeResponse) {
          if (!response) {
            storedResponse = '';
          } else {
            storedResponse = response;
          }
          this.logger.debug('ack() response stored');
        } else {
          if (!response) {
            res.send('');
          } else if (typeof response === 'string') {
            res.send(response);
          } else {
            res.json(response);
          }
          this.logger.debug('ack() response sent');
        }
      },
    };

    try {
      await this.bolt?.processEvent(event);
      if (storedResponse !== undefined) {
        if (typeof storedResponse === 'string') {
          res.send(storedResponse);
        } else {
          res.json(storedResponse);
        }
        this.logger.debug('stored response sent');
      }
    } catch (err) {
      res.status(500).send();
      throw err;
    }
  }
}

export const respondToSslCheck: RequestHandler = (req, res, next) => {
  if (req.body && req.body.ssl_check) {
    res.send();
    return;
  }
  next();
};

export const respondToUrlVerification: RequestHandler = (req, res, next) => {
  if (req.body && req.body.type && req.body.type === 'url_verification') {
    res.json({ challenge: req.body.challenge });
    return;
  }
  next();
};

function logError(logger: Logger, message: string, error: any): void {
  const logMessage =
    'code' in error ? `${message} (code: ${error.code}, message: ${error.message})` : `${message} (error: ${error})`;
  logger.warn(logMessage);
}

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
export function verifySignatureAndParseRawBody(
  logger: Logger,
  signingSecret: string | (() => PromiseLike<string>),
): RequestHandler {
  return async (req, res, next) => {
    let stringBody: string;
    // On some environments like GCP (Google Cloud Platform),
    // req.body can be pre-parsed and be passed as req.rawBody here
    const preparsedRawBody: any = (req as any).rawBody;
    if (preparsedRawBody !== undefined) {
      stringBody = preparsedRawBody.toString();
    } else {
      stringBody = (await rawBody(req)).toString();
    }

    // *** Parsing body ***
    // As the verification passed, parse the body as an object and assign it to req.body
    // Following middlewares can expect `req.body` is already a parsed one.

    try {
      // This handler parses `req.body` or `req.rawBody`(on Google Could Platform)
      // and overwrites `req.body` with the parsed JS object.
      req.body = verifySignatureAndParseBody(
        typeof signingSecret === 'string' ? signingSecret : await signingSecret(),
        stringBody,
        req.headers,
      );
    } catch (error) {
      if (error) {
        if (error instanceof ReceiverAuthenticityError) {
          logError(logger, 'Request verification failed', error);
          return res.status(401).send();
        }

        logError(logger, 'Parsing request body failed', error);
        return res.status(400).send();
      }
    }

    return next();
  };
}

function verifyRequestSignature(
  signingSecret: string,
  body: string,
  signature: string | undefined,
  requestTimestamp: string | undefined,
): void {
  if (signature === undefined || requestTimestamp === undefined) {
    throw new ReceiverAuthenticityError('Slack request signing verification failed. Some headers are missing.');
  }

  const ts = Number(requestTimestamp);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(ts)) {
    throw new ReceiverAuthenticityError('Slack request signing verification failed. Timestamp is invalid.');
  }

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;

  if (ts < fiveMinutesAgo) {
    throw new ReceiverAuthenticityError('Slack request signing verification failed. Timestamp is too old.');
  }

  const hmac = crypto.createHmac('sha256', signingSecret);
  const [version, hash] = signature.split('=');
  hmac.update(`${version}:${ts}:${body}`);

  if (!tsscmp(hash, hmac.digest('hex'))) {
    throw new ReceiverAuthenticityError('Slack request signing verification failed. Signature mismatch.');
  }
}

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
function verifySignatureAndParseBody(
  signingSecret: string,
  body: string,
  headers: Record<string, any>,
): AnyMiddlewareArgs['body'] {
  // *** Request verification ***
  const {
    'x-slack-signature': signature,
    'x-slack-request-timestamp': requestTimestamp,
    'content-type': contentType,
  } = headers;

  verifyRequestSignature(signingSecret, body, signature, requestTimestamp);

  return parseRequestBody(body, contentType);
}

function parseRequestBody(stringBody: string, contentType: string | undefined): any {
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(stringBody);

    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload);
    }

    return parsedBody;
  }

  return JSON.parse(stringBody);
}
