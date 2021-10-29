/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer, Server, ServerOptions, RequestListener, IncomingMessage, ServerResponse } from 'http';
import { createServer as createHttpsServer, Server as HTTPSServer, ServerOptions as HTTPSServerOptions } from 'https';
import { ListenOptions } from 'net';
import { parse as qsParse } from 'querystring';
import { Logger, ConsoleLogger, LogLevel } from '@slack/logger';
import { InstallProvider, CallbackOptions, InstallProviderOptions, InstallURLOptions } from '@slack/oauth';
import { URL } from 'url';

import { verify as verifySlackAuthenticity, BufferedIncomingMessage } from './verify-request';
import { verifyRedirectOpts } from './verify-redirect-opts';
import App from '../App';
import { Receiver, ReceiverEvent } from '../types';
import defaultRenderHtmlForInstallPath from './render-html-for-install-path';
import {
  ReceiverMultipleAckError,
  ReceiverInconsistentStateError,
  HTTPReceiverDeferredRequestError,
  ErrorCode,
  CodedError,
} from '../errors';
import { CustomRoute, prepareRoutes, ReceiverRoutes } from './custom-routes';
import { StringIndexed } from '../types/helpers';
import { extractRetryNum, extractRetryReason } from './http-utils';

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

const missingServerErrorDescription = 'The receiver cannot be started because private state was mutated. Please report this to the maintainers.';

// All the available arguments in the constructor
export interface HTTPReceiverOptions {
  signingSecret: string;
  endpoints?: string | string[];
  port?: number; // if you pass another port number to #start() method, the argument will be used instead
  customRoutes?: CustomRoute[];
  logger?: Logger;
  logLevel?: LogLevel;
  processBeforeResponse?: boolean;
  signatureVerification?: boolean;
  clientId?: string;
  clientSecret?: string;
  stateSecret?: InstallProviderOptions['stateSecret']; // required when using default stateStore
  redirectUri?: string;
  installationStore?: InstallProviderOptions['installationStore']; // default MemoryInstallationStore
  scopes?: InstallURLOptions['scopes'];
  installerOptions?: HTTPReceiverInstallerOptions;
  customPropertiesExtractor?: (request: BufferedIncomingMessage) => StringIndexed;
  // NOTE: As http.RequestListener is not an async function, this cannot be async
  dispatchErrorHandler?: (args: HTTPReceiverDispatchErrorHandlerArgs) => void;
  processEventErrorHandler?: (args: HTTPReceiverProcessEventErrorHandlerArgs) => Promise<boolean>;
  // NOTE: As we use setTimeout under the hood, this cannot be async
  unhandledRequestHandler?: (args: HTTPReceiverUnhandledRequestHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
}

// All the available argument for OAuth flow enabled apps
export interface HTTPReceiverInstallerOptions {
  installPath?: string;
  directInstall?: boolean; // see https://api.slack.com/start/distributing/directory#direct_install
  renderHtmlForInstallPath?: (url: string) => string;
  redirectUriPath?: string;
  stateStore?: InstallProviderOptions['stateStore']; // default ClearStateStore
  stateVerification?: InstallProviderOptions['stateVerification']; // default true
  authVersion?: InstallProviderOptions['authVersion']; // default 'v2'
  clientOptions?: InstallProviderOptions['clientOptions'];
  authorizationUrl?: InstallProviderOptions['authorizationUrl'];
  metadata?: InstallURLOptions['metadata'];
  userScopes?: InstallURLOptions['userScopes'];
  callbackOptions?: CallbackOptions;
  // This value exists here only for the compatibility with SocketModeReceiver.
  // If you use only HTTPReceiver, the top-level is recommended.
  port?: number;
}

// The arguments for the dispatchErrorHandler,
// which handles errors occurred while dispatching a rqeuest
export interface HTTPReceiverDispatchErrorHandlerArgs {
  error: Error | CodedError;
  logger: Logger;
  request: IncomingMessage;
  response: ServerResponse;
}

// The default dispathErrorHandler implementation:
// Developers can customize this behavior by passing dispatchErrorHandler to the constructor
// Note that it was not possible to make this function async due to the limitation of http module
function defaultDispatchErrorHandler(args: HTTPReceiverDispatchErrorHandlerArgs) {
  const { error, logger, request, response } = args;
  if ('code' in error) {
    if (error.code === ErrorCode.HTTPReceiverDeferredRequestError) {
      logger.info(`Unhandled HTTP request (${request.method}) made to ${request.url}`);
      response.writeHead(404);
      response.end();
      return;
    }
  }
  logger.error(`An unexpected error occurred during a request (${request.method}) made to ${request.url}`);
  logger.debug(`Error details: ${error}`);
  response.writeHead(500);
  response.end();
}

// The arguments for the processEventErrorHandler,
// which handles errors `await app.processEvent(even)` method throws
export interface HTTPReceiverProcessEventErrorHandlerArgs {
  error: Error | CodedError;
  logger: Logger;
  request: IncomingMessage;
  response: ServerResponse;
  storedResponse: any;
}

// The default processEventErrorHandler implementation:
// Developers can customize this behavior by passing processEventErrorHandler to the constructor
async function defaultProcessEventErrorHandler(args: HTTPReceiverProcessEventErrorHandlerArgs): Promise<boolean> {
  const { error, response, logger, storedResponse } = args;
  if ('code' in error) {
    // CodedError has code: string
    const errorCode = (error as CodedError).code;
    if (errorCode === ErrorCode.AuthorizationError) {
      // authorize function threw an exception, which means there is no valid installation data
      response.writeHead(401);
      response.end();
      return true;
    }
  }
  logger.error('An unhandled error occurred while Bolt processed an event');
  logger.debug(`Error details: ${error}, storedResponse: ${storedResponse}`);
  response.writeHead(500);
  response.end();
  return false;
}

// The arguments for the unhandledRequestHandler,
// which deals with any unhandled incoming requests from Slack.
// (The default behavior is just printing error logs)
export interface HTTPReceiverUnhandledRequestHandlerArgs {
  logger: Logger;
  request: IncomingMessage;
  response: ServerResponse;
}

// The default unhandledRequestHandler implementation:
// Developers can customize this behavior by passing unhandledRequestHandler to the constructor
// Note that this method cannot be an async function to align with the implementation using setTimeout
function defaultUnhandledRequestHandler(args: HTTPReceiverUnhandledRequestHandlerArgs): void {
  const { logger } = args;
  logger.error(
    'An incoming event was not acknowledged within 3 seconds. ' +
      'Ensure that the ack() argument is called in a listener.',
  );
}

/**
 * Receives HTTP requests with Events, Slash Commands, and Actions
 */
export default class HTTPReceiver implements Receiver {
  private endpoints: string[];

  private port: number; // you can override this value by the #start() method argument

  private routes: ReceiverRoutes;

  private signingSecret: string;

  private processBeforeResponse: boolean;

  private signatureVerification: boolean;

  private app?: App;

  public requestListener: RequestListener;

  private server?: Server;

  public installer?: InstallProvider;

  private installPath?: string; // always defined when installer is defined

  private directInstall?: boolean; // always defined when installer is defined

  private renderHtmlForInstallPath: (url: string) => string;

  private installRedirectUriPath?: string; // always defined when installer is defined

  private installUrlOptions?: InstallURLOptions; // always defined when installer is defined

  private installCallbackOptions?: CallbackOptions; // always defined when installer is defined

  private stateVerification?: boolean; // always defined when installer is defined

  private logger: Logger;

  private customPropertiesExtractor: (request: BufferedIncomingMessage) => StringIndexed;

  private dispatchErrorHandler: (args: HTTPReceiverDispatchErrorHandlerArgs) => void;

  private processEventErrorHandler: (args: HTTPReceiverProcessEventErrorHandlerArgs) => Promise<boolean>;

  private unhandledRequestHandler: (args: HTTPReceiverUnhandledRequestHandlerArgs) => void;

  private unhandledRequestTimeoutMillis: number;

  public constructor({
    signingSecret = '',
    endpoints = ['/slack/events'],
    port = 3000,
    customRoutes = [],
    logger = undefined,
    logLevel = LogLevel.INFO,
    processBeforeResponse = false,
    signatureVerification = true,
    clientId = undefined,
    clientSecret = undefined,
    stateSecret = undefined,
    redirectUri = undefined,
    installationStore = undefined,
    scopes = undefined,
    installerOptions = {},
    customPropertiesExtractor = (_req) => ({}),
    dispatchErrorHandler = defaultDispatchErrorHandler,
    processEventErrorHandler = defaultProcessEventErrorHandler,
    unhandledRequestHandler = defaultUnhandledRequestHandler,
    unhandledRequestTimeoutMillis = 3001,
  }: HTTPReceiverOptions) {
    // Initialize instance variables, substituting defaults for each value
    this.signingSecret = signingSecret;
    this.processBeforeResponse = processBeforeResponse;
    this.signatureVerification = signatureVerification;
    this.logger = logger ??
      (() => {
        const defaultLogger = new ConsoleLogger();
        defaultLogger.setLevel(logLevel);
        return defaultLogger;
      })();
    this.endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];
    this.port = installerOptions?.port ? installerOptions.port : port;
    this.routes = prepareRoutes(customRoutes);

    // Verify redirect options if supplied, throws coded error if invalid
    verifyRedirectOpts({ redirectUri, redirectUriPath: installerOptions.redirectUriPath });

    this.stateVerification = installerOptions.stateVerification;
    // Initialize InstallProvider when it's required options are provided
    if (
      clientId !== undefined &&
      clientSecret !== undefined &&
       (this.stateVerification === false || // state store not needed
         stateSecret !== undefined ||
          installerOptions.stateStore !== undefined) // user provided state store
    ) {
      this.installer = new InstallProvider({
        clientId,
        clientSecret,
        stateSecret,
        installationStore,
        logger,
        logLevel,
        stateStore: installerOptions.stateStore,
        stateVerification: installerOptions.stateVerification,
        authVersion: installerOptions.authVersion,
        clientOptions: installerOptions.clientOptions,
        authorizationUrl: installerOptions.authorizationUrl,
      });

      // Store the remaining instance variables that are related to using the InstallProvider
      this.installPath = installerOptions.installPath ?? '/slack/install';
      this.directInstall = installerOptions.directInstall !== undefined && installerOptions.directInstall;
      this.installRedirectUriPath = installerOptions.redirectUriPath ?? '/slack/oauth_redirect';
      this.installCallbackOptions = installerOptions.callbackOptions ?? {};
      this.installUrlOptions = {
        scopes: scopes ?? [],
        userScopes: installerOptions.userScopes,
        metadata: installerOptions.metadata,
        redirectUri,
      };
    }
    this.renderHtmlForInstallPath = installerOptions.renderHtmlForInstallPath !== undefined ?
      installerOptions.renderHtmlForInstallPath :
      defaultRenderHtmlForInstallPath;
    this.customPropertiesExtractor = customPropertiesExtractor;
    this.dispatchErrorHandler = dispatchErrorHandler;
    this.processEventErrorHandler = processEventErrorHandler;
    this.unhandledRequestHandler = unhandledRequestHandler;
    this.unhandledRequestTimeoutMillis = unhandledRequestTimeoutMillis;

    // Assign the requestListener property by binding the unboundRequestListener to this instance
    this.requestListener = this.unboundRequestListener.bind(this);
  }

  public init(app: App): void {
    this.app = app;
  }

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
    let createServerFn: typeof createServer | typeof createHttpsServer = createServer;

    // Decide which kind of server, HTTP or HTTPS, by searching for any keys in the serverOptions that are exclusive
    // to HTTPS
    if (Object.keys(serverOptions).filter((k) => httpsOptionKeys.includes(k)).length > 0) {
      createServerFn = createHttpsServer;
    }

    if (this.server !== undefined) {
      return Promise.reject(
        new ReceiverInconsistentStateError('The receiver cannot be started because it was already started.'),
      );
    }

    this.server = createServerFn(serverOptions, (req, res) => {
      try {
        this.requestListener(req, res);
      } catch (error) {
        // You may get an error here only when the requestListener failed
        // to start processing incoming requests, or your app receives a request to an unexpected path.
        this.dispatchErrorHandler({
          error: error as Error | CodedError,
          logger: this.logger,
          request: req,
          response: res,
        });
      }
    });

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

      let listenOptions: ListenOptions | number = this.port;
      if (portOrListenOptions !== undefined) {
        if (typeof portOrListenOptions === 'number') {
          listenOptions = portOrListenOptions as number;
        } else if (typeof portOrListenOptions === 'object') {
          listenOptions = portOrListenOptions as ListenOptions;
        }
      }
      this.server.listen(listenOptions, () => {
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
      return Promise.reject(new ReceiverInconsistentStateError('The receiver cannot be stopped because it was not started.'));
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

  private unboundRequestListener(req: IncomingMessage, res: ServerResponse) {
    // Route the request

    // NOTE: the domain and scheme of the following URL object are not necessarily accurate. The URL object is only
    // meant to be used to parse the path and query
    const { pathname: path } = new URL(req.url as string, `http://${req.headers.host}`);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const method = req.method!.toUpperCase();

    if (this.endpoints.includes(path) && method === 'POST') {
      // Handle incoming ReceiverEvent
      return this.handleIncomingEvent(req, res);
    }

    if (this.installer !== undefined && method === 'GET') {
      // When installer is defined then installPath and installRedirectUriPath are always defined
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [installPath, installRedirectUriPath] = [this.installPath!, this.installRedirectUriPath!];

      // Visiting the installation endpoint
      if (path === installPath) {
        // Render installation path (containing Add to Slack button)
        return this.handleInstallPathRequest(res);
      }

      // Installation has been initiated
      if (path === installRedirectUriPath) {
        // Handle OAuth callback request (to exchange authorization grant for a new access token)
        return this.handleInstallRedirectRequest(req, res);
      }
    }

    // Handle custom routes
    if (Object.keys(this.routes).length) {
      const match = this.routes[path] && this.routes[path][method] !== undefined;
      if (match) { return this.routes[path][method](req, res); }
    }

    // If the request did not match the previous conditions, an error is thrown. The error can be caught by the
    // the caller in order to defer to other routing logic (similar to calling `next()` in connect middleware).
    // If you would like to customize the HTTP repsonse for this pattern,
    // implement your own dispatchErrorHandler that handles an exception
    // with ErrorCode.HTTPReceiverDeferredRequestError.
    throw new HTTPReceiverDeferredRequestError(`Unhandled HTTP request (${method}) made to ${path}`, req, res);
  }

  private handleIncomingEvent(req: IncomingMessage, res: ServerResponse) {
    // Wrapped in an async closure for ease of using await
    (async () => {
      let bufferedReq: BufferedIncomingMessage;
      let body: any;

      // Verify authenticity
      try {
        bufferedReq = await verifySlackAuthenticity(
          {
            // If enabled: false, this method returns bufferredReq without verification
            enabled: this.signatureVerification,
            signingSecret: this.signingSecret,
          },
          req,
        );
      } catch (err) {
        const e = err as any;
        this.logger.warn(`Request verification failed: ${e.message}`);
        res.writeHead(401);
        res.end();
        return;
      }

      // Parse request body
      // The object containing the parsed body is not exposed to the caller. It is preferred to reduce mutations to the
      // req object, so that its as reusable as possible. Later, we should consider adding an option for assigning the
      // parsed body to `req.body`, as this convention has been established by the popular `body-parser` package.
      try {
        body = parseBody(bufferedReq);
      } catch (err) {
        const e = err as any;
        this.logger.warn(`Malformed request body: ${e.message}`);
        res.writeHead(400);
        res.end();
        return;
      }

      // Handle SSL checks
      if (body.ssl_check) {
        res.writeHead(200);
        res.end();
        return;
      }

      // Handle URL verification
      if (body.type === 'url_verification') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ challenge: body.challenge }));
        return;
      }

      // Setup ack timeout warning
      let isAcknowledged = false;
      setTimeout(() => {
        if (!isAcknowledged) {
          this.unhandledRequestHandler({
            logger: this.logger,
            request: req,
            response: res,
          });
        }
      }, this.unhandledRequestTimeoutMillis);

      // Structure the ReceiverEvent
      let storedResponse;
      const event: ReceiverEvent = {
        body,
        ack: async (response) => {
          this.logger.debug('ack() begin');
          if (isAcknowledged) {
            throw new ReceiverMultipleAckError();
          }
          isAcknowledged = true;
          if (this.processBeforeResponse) {
            // In the case where processBeforeResponse: true is enabled, we don't send the HTTP response immediately.
            // We hold off until the listener execution is completed.
            if (!response) {
              storedResponse = '';
            } else {
              storedResponse = response;
            }
            this.logger.debug('ack() response stored');
          } else {
            if (!response) {
              res.writeHead(200);
              res.end();
            } else if (typeof response === 'string') {
              res.writeHead(200);
              res.end(response);
            } else {
              res.writeHead(200, { 'content-type': 'application/json' });
              res.end(JSON.stringify(response));
            }
            this.logger.debug('ack() response sent');
          }
        },
        retryNum: extractRetryNum(req),
        retryReason: extractRetryReason(req),
        customProperties: this.customPropertiesExtractor(bufferedReq),
      };

      // Send the event to the app for processing
      try {
        await this.app?.processEvent(event);
        if (storedResponse !== undefined) {
          // in the case of processBeforeResponse: true
          if (typeof storedResponse === 'string') {
            res.writeHead(200);
            res.end(storedResponse);
          } else {
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify(storedResponse));
          }
          this.logger.debug('stored response sent');
        }
      } catch (error) {
        isAcknowledged = await this.processEventErrorHandler({
          error: error as Error | CodedError,
          logger: this.logger,
          request: req,
          response: res,
          storedResponse,
        });
      }
    })();
  }

  private handleInstallPathRequest(res: ServerResponse) {
    // Wrapped in an async closure for ease of using await
    (async () => {
      // NOTE: Skipping some ceremony such as content negotiation, setting informative headers, etc. These may be nice
      // to have for completeness, but there's no clear benefit to adding them, so just keeping things simple. If a
      // user desires a more custom page, they can always call `App.installer.generateInstallUrl()` and render their
      // own page instead of using this one.
      try {
        // This function is only called from within unboundRequestListener after checking that installer is defined, and
        // when installer is defined then installUrlOptions is always defined too.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [installer, installUrlOptions] = [this.installer!, this.installUrlOptions!];
        // Generate the URL for the "Add to Slack" button.
        const url = await installer.generateInstallUrl(installUrlOptions, this.stateVerification);

        if (this.directInstall !== undefined && this.directInstall) {
          // If a Slack app sets "Direct Install URL" in the Slack app configruation,
          // the installation flow of the app should start with the Slack authorize URL.
          // See https://api.slack.com/start/distributing/directory#direct_install for more details.
          res.writeHead(302, { Location: url });
          res.end('');
        } else {
          // The installation starts from a landing page served by this app.
          // Generate HTML response body
          const body = this.renderHtmlForInstallPath(url);

          // Serve a basic HTML page including the "Add to Slack" button.
          // Regarding headers:
          // - Content-Type is usually automatically detected by browsers
          // - Content-Length is not used because Transfer-Encoding='chunked' is automatically used.
          res.writeHead(200);
          res.end(body);
        }
      } catch (err) {
        const e = err as any;
        this.logger.error('An unhandled error occurred while Bolt processed a request to the installation path');
        this.logger.debug(`Error details: ${e}`);
      }
    })();
  }

  private handleInstallRedirectRequest(req: IncomingMessage, res: ServerResponse) {
    // This function is only called from within unboundRequestListener after checking that installer is defined, and
    // when installer is defined then installCallbackOptions is always defined too.
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const [installer, installCallbackOptions, installUrlOptions] = [
      this.installer!,
      this.installCallbackOptions!,
      this.installUrlOptions!,
    ];
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    const errorHandler = (err: Error) => {
      this.logger.error(
        'HTTPReceiver encountered an unexpected error while handling the OAuth install redirect. Please report to the maintainers.',
      );
      this.logger.debug(`Error details: ${err}`);
    };
    if (this.stateVerification === false) {
      // when stateVerification is disabled pass install options directly to handler
      // since they won't be encoded in the state param of the generated url
      installer.handleCallback(req, res, installCallbackOptions, installUrlOptions).catch(errorHandler);
    } else {
      installer.handleCallback(req, res, installCallbackOptions).catch(errorHandler);
    }
  }
}

// Helpers

function parseBody(req: BufferedIncomingMessage) {
  const bodyAsString = req.rawBody.toString();
  const contentType = req.headers['content-type'];
  if (contentType === 'application/x-www-form-urlencoded') {
    const parsedQs = qsParse(bodyAsString);
    const { payload } = parsedQs;
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    }
    return parsedQs;
  }
  return JSON.parse(bodyAsString);
}
