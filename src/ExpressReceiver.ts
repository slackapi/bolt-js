import { EventEmitter } from 'events';
import { Receiver, ReceiverEvent, ReceiverAckTimeoutError } from './types';
import { createServer, Server, Agent } from 'http';
import { SecureContextOptions } from 'tls';
import express, { Request, Response, Application, RequestHandler, NextFunction } from 'express';
import axios, { AxiosInstance } from 'axios';
import rawBody from 'raw-body';
import querystring from 'querystring';
import crypto from 'crypto';
import tsscmp from 'tsscmp';
import { ErrorCode, errorWithCode } from './errors';
import { Logger, ConsoleLogger } from '@slack/logger';

// TODO: we throw away the key names for endpoints, so maybe we should use this interface. is it better for migrations?
// if that's the reason, let's document that with a comment.
export interface ExpressReceiverOptions {
  signingSecret: string;
  logger?: Logger;
  endpoints?: string | {
    [endpointType: string]: string;
  };
  agent?: Agent;
  clientTls?: Pick<SecureContextOptions, 'pfx' | 'key' | 'passphrase' | 'cert' | 'ca'>;
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
export default class ExpressReceiver extends EventEmitter implements Receiver {

  /* Express app */
  public app: Application;

  private server: Server;

  private axios: AxiosInstance;

  constructor({
    signingSecret = '',
    logger = new ConsoleLogger(),
    endpoints = { events: '/slack/events' },
    agent = undefined,
    clientTls = undefined,
  }: ExpressReceiverOptions) {
    super();

    this.app = express();
    this.app.use(this.errorHandler.bind(this));
    // TODO: what about starting an https server instead of http? what about other options to create the server?
    this.server = createServer(this.app);
    this.axios = axios.create(Object.assign(
      {
        httpAgent: agent,
        httpsAgent: agent,
      },
      clientTls,
    ));

    const expressMiddleware: RequestHandler[] = [
      verifySignatureAndParseBody(logger, signingSecret),
      respondToSslCheck,
      respondToUrlVerification,
      this.requestHandler.bind(this),
    ];

    const endpointList: string[] = typeof endpoints === 'string' ? [endpoints] : Object.values(endpoints);
    for (const endpoint of endpointList) {
      this.app.post(endpoint, ...expressMiddleware);
    }
  }

  private requestHandler(req: Request, res: Response): void {
    let timer: NodeJS.Timer | undefined = setTimeout(
      () => {
        this.emit('error', receiverAckTimeoutError(
          'An incoming event was not acknowledged before the timeout. ' +
          'Ensure that the ack() argument is called in your listeners.',
        ));
        timer = undefined;
      },
      2800,
    );
    const event: ReceiverEvent = {
      body: req.body as { [key: string]: any },
      ack: (response: any): void => {
        // TODO: if app tries acknowledging more than once, emit a warning
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;

          if (!response) res.send('');
          if (typeof response === 'string') {
            res.send(response);
          } else {
            res.json(response);
          }
        }
      },
      respond: undefined,
    };

    if (req.body && req.body.response_url) {
      event.respond = (response): void => {
        this.axios.post(req.body.response_url, response)
          .catch((e) => {
            this.emit('error', e);
          });
      };
    }

    this.emit('message', event);
  }

  // TODO: the arguments should be defined as the arguments of Server#listen()
  // TODO: the return value should be defined as a type that both http and https servers inherit from, or a union
  public start(port: number): Promise<Server> {
    return new Promise((resolve, reject) => {
      try {
        // TODO: what about other listener options?
        // TODO: what about asynchronous errors? should we attach a handler for this.server.on('error', ...)?
        // if so, how can we check for only errors related to listening, as opposed to later errors?
        this.server.listen(port, () => {
          resolve(this.server);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // TODO: the arguments should be defined as the arguments to close() (which happen to be none), but for sake of
  // generic types
  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      // TODO: what about synchronous errors?
      this.server.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  private errorHandler(err: any, _req: Request, _res: Response, next: NextFunction): void {
    this.emit('error', err);
    // Forward to express' default error handler (which knows how to print stack traces in development)
    next(err);
  }
}

const respondToSslCheck: RequestHandler = (req, res, next) => {
  if (req.body && req.body.ssl_check) {
    res.send();
    return;
  }
  next();
};

const respondToUrlVerification: RequestHandler = (req, res, next) => {
  if (req.body && req.body.type && req.body.type === 'url_verification') {
    res.json({ challenge: req.body.challenge });
    return;
  }
  next();
};

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
export function verifySignatureAndParseBody(
  logger: Logger,
  signingSecret: string,
): RequestHandler {
  return async (req, _res, next) => {
    try {
      // *** Request verification ***
      let stringBody: string;
      // On some environments like GCP (Google Cloud Platform),
      // req.body can be pre-parsed and be passed as req.rawBody here
      const preparsedRawBody: any = (req as any).rawBody;
      if (preparsedRawBody !== undefined) {
        stringBody = preparsedRawBody.toString();
      } else {
        stringBody = (await rawBody(req)).toString();
      }

      const {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp,
        'content-type': contentType,
      } = req.headers;

      await verifyRequestSignature(
        signingSecret,
        stringBody,
        signature as string | undefined,
        requestTimestamp as string | undefined,
      );

      // *** Parsing body ***
      // As the verification passed, parse the body as an object and assign it to req.body
      // Following middlewares can expect `req.body` is already a parsed one.

      // This handler parses `req.body` or `req.rawBody`(on Google Could Platform)
      // and overwrites `req.body` with the parsed JS object.
      req.body = parseRequestBody(logger, stringBody, contentType);

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

// TODO: this should be imported from another package
async function verifyRequestSignature(
  signingSecret: string,
  body: string,
  signature: string | undefined,
  requestTimestamp: string | undefined,
): Promise<void> {
  if (signature === undefined || requestTimestamp === undefined) {
    throw errorWithCode(
      'Slack request signing verification failed. Some headers are missing.',
      ErrorCode.ExpressReceiverAuthenticityError,
    );
  }

  const ts = Number(requestTimestamp);
  if (isNaN(ts)) {
    throw errorWithCode(
      'Slack request signing verification failed. Timestamp is invalid.',
      ErrorCode.ExpressReceiverAuthenticityError,
    );
  }

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);

  if (ts < fiveMinutesAgo) {
    throw errorWithCode(
      'Slack request signing verification failed. Timestamp is too old.',
      ErrorCode.ExpressReceiverAuthenticityError,
    );
  }

  const hmac = crypto.createHmac('sha256', signingSecret);
  const [version, hash] = signature.split('=');
  hmac.update(`${version}:${ts}:${body}`);

  if (!tsscmp(hash, hmac.digest('hex'))) {
    throw errorWithCode(
      'Slack request signing verification failed. Signature mismatch.',
      ErrorCode.ExpressReceiverAuthenticityError,
    );
  }
}

function parseRequestBody(
  logger: Logger,
  stringBody: string,
  contentType: string | undefined): any {
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

function receiverAckTimeoutError(message: string): ReceiverAckTimeoutError {
  const error = new Error(message);
  (error as ReceiverAckTimeoutError).code = ErrorCode.ReceiverAckTimeoutError;
  return (error as ReceiverAckTimeoutError);
}
