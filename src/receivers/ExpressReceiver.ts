import crypto from 'crypto';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type Server, type ServerOptions, createServer } from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  type Server as HTTPSServer,
  type ServerOptions as HTTPSServerOptions,
  createServer as createHttpsServer,
} from 'https';
import type { ListenOptions } from 'net';
import querystring from 'querystring';
import { ConsoleLogger, LogLevel, type Logger } from '@slack/logger';
import {
  type CallbackOptions,
  type InstallPathOptions,
  InstallProvider,
  type InstallProviderOptions,
  type InstallURLOptions,
} from '@slack/oauth';
import express, {
  type Request,
  type Response,
  type Application,
  type RequestHandler,
  Router,
  type IRouter,
} from 'express';
import rawBody from 'raw-body';
import tsscmp from 'tsscmp';
import type App from '../App';
import { type CodedError, ReceiverAuthenticityError, ReceiverInconsistentStateError } from '../errors';
import type { AnyMiddlewareArgs, Receiver, ReceiverEvent } from '../types';
import type { StringIndexed } from '../types/utilities';
import {
  type ReceiverDispatchErrorHandlerArgs,
  type ReceiverProcessEventErrorHandlerArgs,
  type ReceiverUnhandledRequestHandlerArgs,
  HTTPModuleFunctions as httpFunc,
} from './HTTPModuleFunctions';
import { HTTPResponseAck } from './HTTPResponseAck';
import { verifyRedirectOpts } from './verify-redirect-opts';

// Option keys for tls.createServer() and tls.createSecureContext(), exclusive of those for http.createServer()
const httpsOptionKeys = [
  'ALPNProtocols',
  'clientCertEngine',
  'enableTrace',
  'handshakeTimeout',
  'rejectUnauthorized',
  'requestCert',
  'sessionTimeout',
  'SNICallback',
  'ticketKeys',
  'pskCallback',
  'pskIdentityHint',
  'ca',
  'cert',
  'sigalgs',
  'ciphers',
  'clientCertEngine',
  'crl',
  'dhparam',
  'ecdhCurve',
  'honorCipherOrder',
  'key',
  'privateKeyEngine',
  'privateKeyIdentifier',
  'maxVersion',
  'minVersion',
  'passphrase',
  'pfx',
  'secureOptions',
  'secureProtocol',
  'sessionIdContext',
];

const missingServerErrorDescription =
  'The receiver cannot be started because private state was mutated. Please report this to the maintainers.';

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

// TODO: we throw away the key names for endpoints, so maybe we should use this interface. is it better for migrations?
// if that's the reason, let's document that with a comment.
export interface ExpressReceiverOptions {
  signingSecret: string | (() => PromiseLike<string>);
  logger?: Logger;
  logLevel?: LogLevel;
  endpoints?:
  | string
  | {
    [endpointType: string]: string;
  };
  signatureVerification?: boolean;
  processBeforeResponse?: boolean;
  clientId?: string;
  clientSecret?: string;
  stateSecret?: InstallProviderOptions['stateSecret']; // required when using default stateStore
  redirectUri?: string;
  installationStore?: InstallProviderOptions['installationStore']; // default MemoryInstallationStore
  scopes?: InstallURLOptions['scopes'];
  installerOptions?: InstallerOptions;
  app?: Application;
  router?: IRouter;
  customPropertiesExtractor?: (request: Request) => StringIndexed;
  dispatchErrorHandler?: (args: ReceiverDispatchErrorHandlerArgs) => Promise<void>;
  processEventErrorHandler?: (args: ReceiverProcessEventErrorHandlerArgs) => Promise<boolean>;
  // NOTE: for the compatibility with HTTPResponseAck, this handler is not async
  // If we receive requests to provide async version of this handler,
  // we can add a different name function for it.
  unhandledRequestHandler?: (args: ReceiverUnhandledRequestHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
}

// Additional Installer Options
interface InstallerOptions {
  stateStore?: InstallProviderOptions['stateStore']; // default ClearStateStore
  stateVerification?: InstallProviderOptions['stateVerification']; // defaults true
  legacyStateVerification?: InstallProviderOptions['legacyStateVerification'];
  stateCookieName?: InstallProviderOptions['stateCookieName'];
  stateCookieExpirationSeconds?: InstallProviderOptions['stateCookieExpirationSeconds'];
  authVersion?: InstallProviderOptions['authVersion']; // default 'v2'
  metadata?: InstallURLOptions['metadata'];
  installPath?: string;
  directInstall?: InstallProviderOptions['directInstall']; // see https://api.slack.com/start/distributing/directory#direct_install
  renderHtmlForInstallPath?: InstallProviderOptions['renderHtmlForInstallPath'];
  redirectUriPath?: string;
  installPathOptions?: InstallPathOptions;
  callbackOptions?: CallbackOptions;
  userScopes?: InstallURLOptions['userScopes'];
  clientOptions?: InstallProviderOptions['clientOptions'];
  authorizationUrl?: InstallProviderOptions['authorizationUrl'];
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
export default class ExpressReceiver implements Receiver {
  /* Express app */
  public app: Application;

  private server?: Server;

  private bolt: App | undefined;

  private logger: Logger;

  private processBeforeResponse: boolean;

  private signatureVerification: boolean;

  public router: IRouter;

  public installer: InstallProvider | undefined = undefined;

  public installerOptions?: InstallerOptions;

  private customPropertiesExtractor: (request: Request) => StringIndexed;

  private dispatchErrorHandler: (args: ReceiverDispatchErrorHandlerArgs) => Promise<void>;

  private processEventErrorHandler: (args: ReceiverProcessEventErrorHandlerArgs) => Promise<boolean>;

  private unhandledRequestHandler: (args: ReceiverUnhandledRequestHandlerArgs) => void;

  private unhandledRequestTimeoutMillis: number;

  public constructor({
    signingSecret = '',
    logger = undefined,
    logLevel = LogLevel.INFO,
    endpoints = { events: '/slack/events' },
    processBeforeResponse = false,
    signatureVerification = true,
    clientId = undefined,
    clientSecret = undefined,
    stateSecret = undefined,
    redirectUri = undefined,
    installationStore = undefined,
    scopes = undefined,
    installerOptions = {},
    app = undefined,
    router = undefined,
    customPropertiesExtractor = (_req) => ({}),
    dispatchErrorHandler = httpFunc.defaultAsyncDispatchErrorHandler,
    processEventErrorHandler = httpFunc.defaultProcessEventErrorHandler,
    unhandledRequestHandler = httpFunc.defaultUnhandledRequestHandler,
    unhandledRequestTimeoutMillis = 3001,
  }: ExpressReceiverOptions) {
    this.app = app !== undefined ? app : express();

    if (typeof logger !== 'undefined') {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger();
      this.logger.setLevel(logLevel);
    }

    this.signatureVerification = signatureVerification;
    const bodyParser = this.signatureVerification
      ? buildVerificationBodyParserMiddleware(this.logger, signingSecret)
      : buildBodyParserMiddleware(this.logger);
    const expressMiddleware: RequestHandler[] = [
      bodyParser,
      respondToSslCheck,
      respondToUrlVerification,
      this.requestHandler.bind(this),
    ];
    this.processBeforeResponse = processBeforeResponse;

    const endpointList = typeof endpoints === 'string' ? [endpoints] : Object.values(endpoints);
    this.router = router !== undefined ? router : Router();
    endpointList.forEach((endpoint) => {
      this.router.post(endpoint, ...expressMiddleware);
    });

    this.customPropertiesExtractor = customPropertiesExtractor;
    this.dispatchErrorHandler = dispatchErrorHandler;
    this.processEventErrorHandler = processEventErrorHandler;
    this.unhandledRequestHandler = unhandledRequestHandler;
    this.unhandledRequestTimeoutMillis = unhandledRequestTimeoutMillis;

    // Verify redirect options if supplied, throws coded error if invalid
    verifyRedirectOpts({ redirectUri, redirectUriPath: installerOptions.redirectUriPath });

    if (
      clientId !== undefined &&
      clientSecret !== undefined &&
      (installerOptions.stateVerification === false || // state store not needed
        stateSecret !== undefined ||
        installerOptions.stateStore !== undefined) // user provided state store
    ) {
      this.installer = new InstallProvider({
        clientId,
        clientSecret,
        stateSecret,
        installationStore,
        logLevel,
        logger, // pass logger that was passed in constructor, not one created locally
        directInstall: installerOptions.directInstall,
        stateStore: installerOptions.stateStore,
        stateVerification: installerOptions.stateVerification,
        legacyStateVerification: installerOptions.legacyStateVerification,
        stateCookieName: installerOptions.stateCookieName,
        stateCookieExpirationSeconds: installerOptions.stateCookieExpirationSeconds,
        renderHtmlForInstallPath: installerOptions.renderHtmlForInstallPath,
        authVersion: installerOptions.authVersion ?? 'v2',
        clientOptions: installerOptions.clientOptions,
        authorizationUrl: installerOptions.authorizationUrl,
      });
    }
    // create install url options
    const installUrlOptions = {
      metadata: installerOptions.metadata,
      scopes: scopes ?? [],
      userScopes: installerOptions.userScopes,
      redirectUri,
    };
    // Add OAuth routes to receiver
    if (this.installer !== undefined) {
      const { installer } = this;
      const redirectUriPath =
        installerOptions.redirectUriPath === undefined ? '/slack/oauth_redirect' : installerOptions.redirectUriPath;
      const { callbackOptions, stateVerification } = installerOptions;
      this.router.use(redirectUriPath, async (req, res) => {
        try {
          if (stateVerification === false) {
            // when stateVerification is disabled pass install options directly to handler
            // since they won't be encoded in the state param of the generated url
            await installer.handleCallback(req, res, callbackOptions, installUrlOptions);
          } else {
            await installer.handleCallback(req, res, callbackOptions);
          }
        } catch (e) {
          await this.dispatchErrorHandler({
            error: e as Error | CodedError,
            logger: this.logger,
            request: req,
            response: res,
          });
        }
      });

      const installPath = installerOptions.installPath === undefined ? '/slack/install' : installerOptions.installPath;
      const { installPathOptions } = installerOptions;
      this.router.get(installPath, async (req, res, next) => {
        try {
          try {
            await installer.handleInstallPath(req, res, installPathOptions, installUrlOptions);
          } catch (error) {
            next(error);
          }
        } catch (e) {
          await this.dispatchErrorHandler({
            error: e as Error | CodedError,
            logger: this.logger,
            request: req,
            response: res,
          });
        }
      });
    }

    this.app.use(this.router);
  }

  public async requestHandler(req: Request, res: Response): Promise<void> {
    const ack = new HTTPResponseAck({
      logger: this.logger,
      processBeforeResponse: this.processBeforeResponse,
      unhandledRequestHandler: this.unhandledRequestHandler,
      unhandledRequestTimeoutMillis: this.unhandledRequestTimeoutMillis,
      httpRequest: req,
      httpResponse: res,
    });
    const event: ReceiverEvent = {
      body: req.body,
      ack: ack.bind(),
      retryNum: httpFunc.extractRetryNumFromHTTPRequest(req),
      retryReason: httpFunc.extractRetryReasonFromHTTPRequest(req),
      customProperties: this.customPropertiesExtractor(req),
    };

    try {
      await this.bolt?.processEvent(event);
      if (ack.storedResponse !== undefined) {
        httpFunc.buildContentResponse(res, ack.storedResponse);
        this.logger.debug('stored response sent');
      }
    } catch (err) {
      const acknowledgedByHandler = await this.processEventErrorHandler({
        error: err as Error | CodedError,
        logger: this.logger,
        request: req,
        response: res,
        storedResponse: ack.storedResponse,
      });
      if (acknowledgedByHandler) {
        // If the value is false, we don't touch the value as a race condition
        // with ack() call may occur especially when processBeforeResponse: false
        ack.ack();
      }
    }
  }

  public init(bolt: App): void {
    this.bolt = bolt;
  }

  // TODO: can this method be defined as generic instead of using overloads?
  public start(port: number): Promise<Server>;
  public start(portOrListenOptions: number | ListenOptions, serverOptions?: ServerOptions): Promise<Server>;
  public start(
    portOrListenOptions: number | ListenOptions,
    httpsServerOptions?: HTTPSServerOptions,
  ): Promise<HTTPSServer>;
  public start(
    portOrListenOptions: number | ListenOptions,
    serverOptions: ServerOptions | HTTPSServerOptions = {},
  ): Promise<Server | HTTPSServer> {
    let createServerFn:
      | typeof createServer<typeof IncomingMessage, typeof ServerResponse>
      | typeof createHttpsServer<typeof IncomingMessage, typeof ServerResponse> = createServer;

    // Look for HTTPS-specific serverOptions to determine which factory function to use
    if (Object.keys(serverOptions).filter((k) => httpsOptionKeys.includes(k)).length > 0) {
      createServerFn = createHttpsServer;
    }

    if (this.server !== undefined) {
      return Promise.reject(
        new ReceiverInconsistentStateError('The receiver cannot be started because it was already started.'),
      );
    }

    this.server = createServerFn(serverOptions, this.app);

    return new Promise((resolve, reject) => {
      if (this.server === undefined) {
        throw new ReceiverInconsistentStateError(missingServerErrorDescription);
      }

      this.server.on('error', (error) => {
        if (this.server === undefined) {
          throw new ReceiverInconsistentStateError(missingServerErrorDescription);
        }

        this.server.close();

        // If the error event occurs before listening completes (like EADDRINUSE), this works well. However, if the
        // error event happens some after the Promise is already resolved, the error would be silently swallowed up.
        // The documentation doesn't describe any specific errors that can occur after listening has started, so this
        // feels safe.
        reject(error);
      });

      this.server.on('close', () => {
        // Not removing all listeners because consumers could have added their own `close` event listener, and those
        // should be called. If the consumer doesn't dispose of any references to the server properly, this would be
        // a memory leak.
        // this.server?.removeAllListeners();
        this.server = undefined;
      });

      this.server.listen(portOrListenOptions, () => {
        if (this.server === undefined) {
          return reject(new ReceiverInconsistentStateError(missingServerErrorDescription));
        }

        return resolve(this.server);
      });
    });
  }

  // TODO: the arguments should be defined as the arguments to close() (which happen to be none), but for sake of
  // generic types
  public stop(): Promise<void> {
    if (this.server === undefined) {
      return Promise.reject(
        new ReceiverInconsistentStateError('The receiver cannot be stopped because it was not started.'),
      );
    }
    return new Promise((resolve, reject) => {
      this.server?.close((error) => {
        if (error !== undefined) {
          return reject(error);
        }

        this.server = undefined;
        return resolve();
      });
    });
  }
}

export function verifySignatureAndParseRawBody(
  logger: Logger,
  signingSecret: string | (() => PromiseLike<string>),
): RequestHandler {
  return buildVerificationBodyParserMiddleware(logger, signingSecret);
}

/**
 * This request handler has two responsibilities:
 * - Verify the request signature
 * - Parse request.body and assign the successfully parsed object to it.
 */
function buildVerificationBodyParserMiddleware(
  logger: Logger,
  signingSecret: string | (() => PromiseLike<string>),
): RequestHandler {
  return async (req, res, next): Promise<void> => {
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
          res.status(401).send();
          return;
        }

        logError(logger, 'Parsing request body failed', error);
        res.status(400).send();
        return;
      }
    }

    next();
  };
}

function logError(logger: Logger, message: string, error: any): void {
  const logMessage =
    'code' in error ? `${message} (code: ${error.code}, message: ${error.message})` : `${message} (error: ${error})`;
  logger.warn(logMessage);
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
 * - Parse `request.body` and assign the successfully parsed object to it.
 */
export function verifySignatureAndParseBody(
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

export function buildBodyParserMiddleware(logger: Logger): RequestHandler {
  return async (req, res, next): Promise<void> => {
    let stringBody: string;
    // On some environments like GCP (Google Cloud Platform),
    // req.body can be pre-parsed and be passed as req.rawBody here
    const preparsedRawBody: any = (req as any).rawBody;
    if (preparsedRawBody !== undefined) {
      stringBody = preparsedRawBody.toString();
    } else {
      stringBody = (await rawBody(req)).toString();
    }
    try {
      const { 'content-type': contentType } = req.headers;
      req.body = parseRequestBody(stringBody, contentType);
    } catch (error) {
      if (error) {
        logError(logger, 'Parsing request body failed', error);
        res.status(400).send();
        return;
      }
    }
    next();
  };
}

function parseRequestBody(stringBody: string, contentType: string | undefined): any {
  if (contentType === 'application/x-www-form-urlencoded') {
    // TODO: querystring is deprecated since Node.js v17
    const parsedBody = querystring.parse(stringBody);

    if (typeof parsedBody.payload === 'string') {
      return JSON.parse(parsedBody.payload);
    }

    return parsedBody;
  }

  return JSON.parse(stringBody);
}
