import { AnyMiddlewareArgs, Receiver, ReceiverEvent } from './types';
import { createServer, Server } from 'http';
import express, { Request, Response, Application, RequestHandler, Router } from 'express';
import rawBody from 'raw-body';
import querystring from 'querystring';
import crypto from 'crypto';
import tsscmp from 'tsscmp';
import App from './App';
import { ReceiverAuthenticityError, ReceiverMultipleAckError } from './errors';
import { Logger, ConsoleLogger } from '@slack/logger';
import { InstallProvider, StateStore, InstallationStore, CallbackOptions } from '@slack/oauth';

// TODO: we throw away the key names for endpoints, so maybe we should use this interface. is it better for migrations?
// if that's the reason, let's document that with a comment.
export interface ExpressReceiverOptions {
  signingSecret: string;
  logger?: Logger;
  endpoints?: string | {
    [endpointType: string]: string;
  };
  processBeforeResponse?: boolean;
  clientId?: string;
  clientSecret?: string;
  stateSecret?: string; // ClearStateStoreOptions['secret']; // required when using default stateStore
  installationStore?: InstallationStore; // default MemoryInstallationStore
  scopes?: string | string[];
  installerOptions?: InstallerOptions;
}

// Additional Installer Options
interface InstallerOptions {
  stateStore?: StateStore; // default ClearStateStore
  authVersion?: 'v1' | 'v2'; // default 'v2'
  metadata?: string;
  installPath?: string;
  redirectUriPath?: string;
  callbackOptions?: CallbackOptions;
  userScopes?: string | string[];
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
export default class ExpressReceiver implements Receiver {

  /* Express app */
  public app: Application;

  private server: Server;
  private bolt: App | undefined;
  private logger: Logger;
  private processBeforeResponse: boolean;
  public router: Router;
  public installer: InstallProvider | undefined = undefined;

  constructor({
    signingSecret = '',
    logger = new ConsoleLogger(),
    endpoints = { events: '/slack/events' },
    processBeforeResponse = false,
    clientId = undefined,
    clientSecret = undefined,
    stateSecret = undefined,
    installationStore = undefined,
    scopes = undefined,
    installerOptions = {},
  }: ExpressReceiverOptions) {
    this.app = express();
    // TODO: what about starting an https server instead of http? what about other options to create the server?
    this.server = createServer(this.app);

    const expressMiddleware: RequestHandler[] = [
      verifySignatureAndParseRawBody(logger, signingSecret),
      respondToSslCheck,
      respondToUrlVerification,
      this.requestHandler.bind(this),
    ];

    this.processBeforeResponse = processBeforeResponse;
    this.logger = logger;
    const endpointList = typeof endpoints === 'string' ? [endpoints] : Object.values(endpoints);
    this.router = Router();
    for (const endpoint of endpointList) {
      this.router.post(endpoint, ...expressMiddleware);
    }

    if (
      clientId !== undefined
      && clientSecret !== undefined
      && (stateSecret !== undefined || installerOptions.stateStore !== undefined)
    ) {

      this.installer = new InstallProvider({
        clientId,
        clientSecret,
        stateSecret,
        installationStore,
        stateStore: installerOptions.stateStore,
        authVersion: installerOptions.authVersion!,
      });
    }

    // Add OAuth routes to receiver
    if (this.installer !== undefined) {
      const redirectUriPath = installerOptions.redirectUriPath === undefined ?
        '/slack/oauth_redirect' : installerOptions.redirectUriPath;
      this.router.use(redirectUriPath, async (req, res) => {
        await this.installer!.handleCallback(req, res, installerOptions.callbackOptions);
      });

      const installPath = installerOptions.installPath === undefined ?
      '/slack/install' : installerOptions.installPath;
      this.router.get(installPath, async (_req, res, next) => {
        try {
          const url = await this.installer!.generateInstallUrl({
            metadata: installerOptions.metadata,
            scopes: scopes!,
            userScopes: installerOptions.userScopes,
          });
          res.send(`<a href=${url}><img alt=""Add to Slack"" height="40" width="139"
              src="https://platform.slack-edge.com/img/add_to_slack.png"
              srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
              https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>`);
        } catch (error) {
          next(error);
        }
      });
    }

    this.app.use(this.router);
  }

  private async requestHandler(req: Request, res: Response): Promise<void> {
    let isAcknowledged = false;
    setTimeout(() => {
      if (!isAcknowledged) {
        this.logger.error('An incoming event was not acknowledged within 3 seconds. ' +
            'Ensure that the ack() argument is called in a listener.');
      }
    // tslint:disable-next-line: align
    }, 3001);

    let storedResponse = undefined;
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

  public init(bolt: App): void {
    this.bolt = bolt;
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

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
export function verifySignatureAndParseRawBody(
  logger: Logger,
  signingSecret: string,
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
      req.body = verifySignatureAndParseBody(signingSecret, stringBody, req.headers);
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

function logError(logger: Logger, message: string, error: any): void {
  const logMessage = ('code' in error)
    ? `${message} (code: ${error.code}, message: ${error.message})`
    : `${message} (error: ${error})`;
  logger.warn(logMessage);
}

function verifyRequestSignature(
    signingSecret: string,
    body: string,
    signature: string | undefined,
    requestTimestamp: string | undefined,
): void {
  if (signature === undefined || requestTimestamp === undefined) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Some headers are missing.',
    );
  }

  const ts = Number(requestTimestamp);
  if (isNaN(ts)) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Timestamp is invalid.',
    );
  }

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - (60 * 5);

  if (ts < fiveMinutesAgo) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Timestamp is too old.',
    );
  }

  const hmac = crypto.createHmac('sha256', signingSecret);
  const [version, hash] = signature.split('=');
  hmac.update(`${version}:${ts}:${body}`);

  if (!tsscmp(hash, hmac.digest('hex'))) {
    throw new ReceiverAuthenticityError(
        'Slack request signing verification failed. Signature mismatch.',
    );
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

  verifyRequestSignature(
      signingSecret,
      body,
      signature,
      requestTimestamp,
  );

  return parseRequestBody(body, contentType);
}

function parseRequestBody(
    stringBody: string,
    contentType: string | undefined,
): any {
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedBody = querystring.parse(stringBody);

    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload);
    }

    return parsedBody;
  }

  return JSON.parse(stringBody);
}
