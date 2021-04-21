/* eslint-disable @typescript-eslint/explicit-member-accessibility, @typescript-eslint/strict-boolean-expressions */

import { createServer, Server, ServerOptions } from 'http';
import { createServer as createHttpsServer, Server as HTTPSServer, ServerOptions as HTTPSServerOptions } from 'https';
import { ListenOptions } from 'net';
import express, { Application, Router } from 'express';
import { Logger, ConsoleLogger, LogLevel } from '@slack/logger';
import { InstallProvider, CallbackOptions, InstallProviderOptions, InstallURLOptions } from '@slack/oauth';
import App from '../App';
import { ReceiverInconsistentStateError } from '../errors';
import { Receiver } from '../types';
import { renderHtmlForInstallPath } from './render-html-for-install-path';
import ExpressMiddleware from './ExpressMiddleware';

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
  processBeforeResponse?: boolean;
  clientId?: string;
  clientSecret?: string;
  stateSecret?: InstallProviderOptions['stateSecret']; // required when using default stateStore
  installationStore?: InstallProviderOptions['installationStore']; // default MemoryInstallationStore
  scopes?: InstallURLOptions['scopes'];
  installerOptions?: InstallerOptions;
}

// Additional Installer Options
interface InstallerOptions {
  stateStore?: InstallProviderOptions['stateStore']; // default ClearStateStore
  authVersion?: InstallProviderOptions['authVersion']; // default 'v2'
  metadata?: InstallURLOptions['metadata'];
  installPath?: string;
  redirectUriPath?: string;
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

  private middleware: ExpressMiddleware;

  private logger: Logger;

  public router: Router;

  public installer: InstallProvider | undefined = undefined;

  constructor({
    signingSecret = '',
    logger = undefined,
    logLevel = LogLevel.INFO,
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

    if (typeof logger !== 'undefined') {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger();
      this.logger.setLevel(logLevel);
    }

    if (typeof logger !== 'undefined') {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger();
      this.logger.setLevel(logLevel);
    }

    this.middleware = new ExpressMiddleware({
      signingSecret,
      logger: this.logger,
      logLevel: this.logger.getLevel(),
      processBeforeResponse
    })

    const endpointList = typeof endpoints === 'string' ? [endpoints] : Object.values(endpoints);
    this.router = Router();
    endpointList.forEach((endpoint) => {
      this.router.post(endpoint, ...this.middleware.getMiddleware());
    });

    if (
      clientId !== undefined &&
      clientSecret !== undefined &&
      (stateSecret !== undefined || installerOptions.stateStore !== undefined)
    ) {
      this.installer = new InstallProvider({
        clientId,
        clientSecret,
        stateSecret,
        installationStore,
        logLevel,
        logger, // pass logger that was passed in constructor, not one created locally
        stateStore: installerOptions.stateStore,
        authVersion: installerOptions.authVersion!,
        clientOptions: installerOptions.clientOptions,
        authorizationUrl: installerOptions.authorizationUrl,
      });
    }

    // Add OAuth routes to receiver
    if (this.installer !== undefined) {
      const redirectUriPath =
        installerOptions.redirectUriPath === undefined ? '/slack/oauth_redirect' : installerOptions.redirectUriPath;
      this.router.use(redirectUriPath, async (req, res) => {
        await this.installer!.handleCallback(req, res, installerOptions.callbackOptions);
      });

      const installPath = installerOptions.installPath === undefined ? '/slack/install' : installerOptions.installPath;
      this.router.get(installPath, async (_req, res, next) => {
        try {
          const url = await this.installer!.generateInstallUrl({
            metadata: installerOptions.metadata,
            scopes: scopes!,
            userScopes: installerOptions.userScopes,
          });
          res.send(renderHtmlForInstallPath(url));
        } catch (error) {
          next(error);
        }
      });
    }

    this.app.use(this.router);
  }

  public init(bolt: App): void {
    this.middleware.init(bolt);
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
    let createServerFn: typeof createServer | typeof createHttpsServer = createServer;

    // Decide which kind of server, HTTP or HTTPS, by search for any keys in the serverOptions that are exclusive to HTTPS
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

        resolve(this.server);
      });
    });
  }

  // TODO: the arguments should be defined as the arguments to close() (which happen to be none), but for sake of
  // generic types
  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server === undefined) {
        return reject(new ReceiverInconsistentStateError('The receiver cannot be stopped because it was not started.'));
      }
      this.server.close((error) => {
        if (error !== undefined) {
          return reject(error);
        }

        this.server = undefined;
        resolve();
      });
    });
  }
}

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
