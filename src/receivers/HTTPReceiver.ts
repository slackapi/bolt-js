/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer, Server, ServerOptions, RequestListener, IncomingMessage, ServerResponse } from 'http';
import { createServer as createHttpsServer, Server as HTTPSServer, ServerOptions as HTTPSServerOptions } from 'https';
import { ListenOptions } from 'net';
import { Logger, ConsoleLogger, LogLevel } from '@slack/logger';
import { InstallProvider, CallbackOptions, InstallProviderOptions, InstallURLOptions, InstallPathOptions } from '@slack/oauth';
import { URL } from 'url';

import { verifyRedirectOpts } from './verify-redirect-opts';
import App from '../App';
import { Receiver, ReceiverEvent } from '../types';
import {
  ReceiverInconsistentStateError,
  HTTPReceiverDeferredRequestError,
  CodedError,
} from '../errors';
import { CustomRoute, buildReceiverRoutes, ReceiverRoutes } from './custom-routes';
import { StringIndexed } from '../types/helpers';
import { BufferedIncomingMessage } from './BufferedIncomingMessage';
import {
  HTTPModuleFunctions as httpFunc,
  ReceiverDispatchErrorHandlerArgs,
  ReceiverProcessEventErrorHandlerArgs,
  ReceiverUnhandledRequestHandlerArgs,
} from './HTTPModuleFunctions';
import { HTTPResponseAck } from './HTTPResponseAck';

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
  dispatchErrorHandler?: (args: ReceiverDispatchErrorHandlerArgs) => void;
  processEventErrorHandler?: (args: ReceiverProcessEventErrorHandlerArgs) => Promise<boolean>;
  // NOTE: As we use setTimeout under the hood, this cannot be async
  unhandledRequestHandler?: (args: ReceiverUnhandledRequestHandlerArgs) => void;
  unhandledRequestTimeoutMillis?: number;
}

// All the available argument for OAuth flow enabled apps
export interface HTTPReceiverInstallerOptions {
  installPath?: string;
  directInstall?: InstallProviderOptions['directInstall']; // see https://api.slack.com/start/distributing/directory#direct_install
  renderHtmlForInstallPath?: InstallProviderOptions['renderHtmlForInstallPath'];
  redirectUriPath?: string;
  stateStore?: InstallProviderOptions['stateStore']; // default ClearStateStore
  stateVerification?: InstallProviderOptions['stateVerification']; // default true
  legacyStateVerification?: InstallProviderOptions['legacyStateVerification'];
  stateCookieName?: InstallProviderOptions['stateCookieName'];
  stateCookieExpirationSeconds?: InstallProviderOptions['stateCookieExpirationSeconds'];
  authVersion?: InstallProviderOptions['authVersion']; // default 'v2'
  clientOptions?: InstallProviderOptions['clientOptions'];
  authorizationUrl?: InstallProviderOptions['authorizationUrl'];
  metadata?: InstallURLOptions['metadata'];
  userScopes?: InstallURLOptions['userScopes'];
  installPathOptions?: InstallPathOptions;
  callbackOptions?: CallbackOptions;
  // This value exists here only for the compatibility with SocketModeReceiver.
  // If you use only HTTPReceiver, the top-level is recommended.
  port?: number;
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

  private installRedirectUriPath?: string; // always defined when installer is defined

  private installUrlOptions?: InstallURLOptions; // always defined when installer is defined

  private installPathOptions?: InstallPathOptions; // always defined when installer is defined

  private installCallbackOptions?: CallbackOptions; // always defined when installer is defined

  private stateVerification?: boolean; // always defined when installer is defined

  private logger: Logger;

  private customPropertiesExtractor: (request: BufferedIncomingMessage) => StringIndexed;

  private dispatchErrorHandler: (args: ReceiverDispatchErrorHandlerArgs) => void;

  private processEventErrorHandler: (args: ReceiverProcessEventErrorHandlerArgs) => Promise<boolean>;

  private unhandledRequestHandler: (args: ReceiverUnhandledRequestHandlerArgs) => void;

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
    dispatchErrorHandler = httpFunc.defaultDispatchErrorHandler,
    processEventErrorHandler = httpFunc.defaultProcessEventErrorHandler,
    unhandledRequestHandler = httpFunc.defaultUnhandledRequestHandler,
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
    this.routes = buildReceiverRoutes(customRoutes);

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
        directInstall: installerOptions.directInstall,
        stateStore: installerOptions.stateStore,
        stateVerification: installerOptions.stateVerification,
        legacyStateVerification: installerOptions.legacyStateVerification,
        stateCookieName: installerOptions.stateCookieName,
        stateCookieExpirationSeconds: installerOptions.stateCookieExpirationSeconds,
        renderHtmlForInstallPath: installerOptions.renderHtmlForInstallPath,
        authVersion: installerOptions.authVersion,
        clientOptions: installerOptions.clientOptions,
        authorizationUrl: installerOptions.authorizationUrl,
      });

      // Store the remaining instance variables that are related to using the InstallProvider
      this.installPath = installerOptions.installPath ?? '/slack/install';
      this.installRedirectUriPath = installerOptions.redirectUriPath ?? '/slack/oauth_redirect';
      this.installPathOptions = installerOptions.installPathOptions ?? {};
      this.installCallbackOptions = installerOptions.callbackOptions ?? {};
      this.installUrlOptions = {
        scopes: scopes ?? [],
        userScopes: installerOptions.userScopes,
        metadata: installerOptions.metadata,
        redirectUri,
      };
    }
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
  public start(port: string): Promise<Server>;
  public start(portOrListenOptions: number | string | ListenOptions, serverOptions?: ServerOptions): Promise<Server>;
  public start(
    portOrListenOptions: number | string | ListenOptions,
    httpsServerOptions?: HTTPSServerOptions,
  ): Promise<HTTPSServer>;
  public start(
    portOrListenOptions: number | string | ListenOptions,
    serverOptions: ServerOptions | HTTPSServerOptions = {},
  ): Promise<Server | HTTPSServer> {
    let createServerFn:
    typeof createServer<typeof IncomingMessage, typeof ServerResponse> |
    typeof createHttpsServer<typeof IncomingMessage, typeof ServerResponse> = createServer;

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
        } else if (typeof portOrListenOptions === 'string') {
          listenOptions = Number(portOrListenOptions) as number;
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

    // NOTE: the domain and scheme are irrelevant here.
    // The URL object is only used to safely obtain the path to match
    const { pathname: path } = new URL(req.url as string, 'http://localhost');
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
        return this.handleInstallPathRequest(req, res);
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

    // If the request did not match the previous conditions, an error is thrown. The error can be caught by
    // the caller in order to defer to other routing logic (similar to calling `next()` in connect middleware).
    // If you would like to customize the HTTP response for this pattern,
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
        bufferedReq = await httpFunc.parseAndVerifyHTTPRequest(
          {
            // If enabled: false, this method returns bufferedReq without verification
            enabled: this.signatureVerification,
            signingSecret: this.signingSecret,
          },
          req,
        );
      } catch (err) {
        const e = err as any;
        if (this.signatureVerification) {
          this.logger.warn(`Failed to parse and verify the request data: ${e.message}`);
        } else {
          this.logger.warn(`Failed to parse the request body: ${e.message}`);
        }
        httpFunc.buildNoBodyResponse(res, 401);
        return;
      }

      // Parse request body
      // The object containing the parsed body is not exposed to the caller. It is preferred to reduce mutations to the
      // req object, so that it's as reusable as possible. Later, we should consider adding an option for assigning the
      // parsed body to `req.body`, as this convention has been established by the popular `body-parser` package.
      try {
        body = httpFunc.parseHTTPRequestBody(bufferedReq);
      } catch (err) {
        const e = err as any;
        this.logger.warn(`Malformed request body: ${e.message}`);
        httpFunc.buildNoBodyResponse(res, 400);
        return;
      }

      // Handle SSL checks
      if (body.ssl_check) {
        httpFunc.buildNoBodyResponse(res, 200);
        return;
      }

      // Handle URL verification
      if (body.type === 'url_verification') {
        httpFunc.buildUrlVerificationResponse(res, body);
        return;
      }

      const ack = new HTTPResponseAck({
        logger: this.logger,
        processBeforeResponse: this.processBeforeResponse,
        unhandledRequestHandler: this.unhandledRequestHandler,
        unhandledRequestTimeoutMillis: this.unhandledRequestTimeoutMillis,
        httpRequest: bufferedReq,
        httpResponse: res,
      });
      // Structure the ReceiverEvent
      const event: ReceiverEvent = {
        body,
        ack: ack.bind(),
        retryNum: httpFunc.extractRetryNumFromHTTPRequest(req),
        retryReason: httpFunc.extractRetryReasonFromHTTPRequest(req),
        customProperties: this.customPropertiesExtractor(bufferedReq),
      };

      // Send the event to the app for processing
      try {
        await this.app?.processEvent(event);
        if (ack.storedResponse !== undefined) {
          // in the case of processBeforeResponse: true
          httpFunc.buildContentResponse(res, ack.storedResponse);
          this.logger.debug('stored response sent');
        }
      } catch (error) {
        const acknowledgedByHandler = await this.processEventErrorHandler({
          error: error as Error | CodedError,
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
    })();
  }

  private handleInstallPathRequest(req: IncomingMessage, res: ServerResponse) {
    // Wrapped in an async closure for ease of using await
    (async () => {
      try {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        await this.installer!.handleInstallPath(
          req,
          res,
          this.installPathOptions,
          this.installUrlOptions,
        );
      } catch (err) {
        const e = err as any;
        this.logger.error(`An unhandled error occurred while Bolt processed a request to the installation path (${e.message})`);
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
