/* eslint-disable @typescript-eslint/no-explicit-any */
import { SocketModeClient } from '@slack/socket-mode';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Logger, ConsoleLogger, LogLevel } from '@slack/logger';
import { InstallProvider, CallbackOptions, InstallProviderOptions, InstallURLOptions } from '@slack/oauth';
import { AppsConnectionsOpenResponse } from '@slack/web-api';
import App from '../App';
import { Receiver, ReceiverEvent } from '../types';
import defaultRenderHtmlForInstallPath from './render-html-for-install-path';
import { CustomRouteInitializationError } from '../errors';

// TODO: we throw away the key names for endpoints, so maybe we should use this interface. is it better for migrations?
// if that's the reason, let's document that with a comment.
export interface SocketModeReceiverOptions {
  logger?: Logger;
  logLevel?: LogLevel;
  clientId?: string;
  clientSecret?: string;
  stateSecret?: InstallProviderOptions['stateSecret']; // required when using default stateStore
  installationStore?: InstallProviderOptions['installationStore']; // default MemoryInstallationStore
  scopes?: InstallURLOptions['scopes'];
  installerOptions?: InstallerOptions;
  appToken: string; // App Level Token
  customRoutes?: CustomRoute[];
}

export interface CustomRoute {
  path: string;
  method: string | string[];
  callback: (req: IncomingMessage, res: ServerResponse) => void;
}

// Additional Installer Options
interface InstallerOptions {
  stateStore?: InstallProviderOptions['stateStore']; // default ClearStateStore
  authVersion?: InstallProviderOptions['authVersion']; // default 'v2'
  metadata?: InstallURLOptions['metadata'];
  installPath?: string;
  directInstall?: boolean; // see https://api.slack.com/start/distributing/directory#direct_install
  renderHtmlForInstallPath?: (url: string) => string;
  redirectUriPath?: string;
  callbackOptions?: CallbackOptions;
  userScopes?: InstallURLOptions['userScopes'];
  clientOptions?: InstallProviderOptions['clientOptions'];
  authorizationUrl?: InstallProviderOptions['authorizationUrl'];
  port?: number; // used to create a server when doing OAuth
}

/**
 * Receives Events, Slash Commands, and Actions of a web socket connection
 */
export default class SocketModeReceiver implements Receiver {
  /* Express app */
  public client: SocketModeClient;

  private app: App | undefined;

  private logger: Logger;

  public installer: InstallProvider | undefined = undefined;

  private customRoutes: CustomRoute[];

  public constructor({
    appToken,
    logger = undefined,
    logLevel = LogLevel.INFO,
    clientId = undefined,
    clientSecret = undefined,
    stateSecret = undefined,
    installationStore = undefined,
    scopes = undefined,
    installerOptions = {},
    customRoutes = [],
  }: SocketModeReceiverOptions) {
    this.client = new SocketModeClient({
      appToken,
      logLevel,
      logger,
      clientOptions: installerOptions.clientOptions,
    });

    this.logger = logger ?? (() => {
      const defaultLogger = new ConsoleLogger();
      defaultLogger.setLevel(logLevel);
      return defaultLogger;
    })();
    this.customRoutes = prepareCustomRoutes(customRoutes);

    // Initialize InstallProvider
    if (clientId !== undefined && clientSecret !== undefined &&
      (stateSecret !== undefined || installerOptions.stateStore !== undefined)) {
      this.installer = new InstallProvider({
        clientId,
        clientSecret,
        stateSecret,
        installationStore,
        logLevel,
        logger, // pass logger that was passed in constructor, not one created locally
        stateStore: installerOptions.stateStore,
        authVersion: installerOptions.authVersion ?? 'v2',
        clientOptions: installerOptions.clientOptions,
        authorizationUrl: installerOptions.authorizationUrl,
      });
    }

    // Add OAuth and/or custom routes to receiver
    if (this.installer !== undefined || this.customRoutes.length) {
      // use default or passed in redirect path
      const redirectUriPath = installerOptions.redirectUriPath === undefined ? '/slack/oauth_redirect' : installerOptions.redirectUriPath;

      // use default or passed in installPath
      const installPath = installerOptions.installPath === undefined ? '/slack/install' : installerOptions.installPath;
      const directInstallEnabled = installerOptions.directInstall !== undefined && installerOptions.directInstall;
      const port = installerOptions.port === undefined ? 3000 : installerOptions.port;

      const server = createServer(async (req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const method = req.method!.toUpperCase();

        // Handle OAuth-related requests
        if (this.installer) {
          // Installation has been initiated
          if (req.url && req.url.startsWith(redirectUriPath)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await this.installer!.handleCallback(req, res, installerOptions.callbackOptions);
            return;
          }

          // Visiting the installation endpoint
          if (req.url && req.url.startsWith(installPath)) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const url = await this.installer!.generateInstallUrl({
                metadata: installerOptions.metadata,
                scopes: scopes ?? [],
                userScopes: installerOptions.userScopes,
              });
              if (directInstallEnabled) {
                res.writeHead(302, { Location: url });
                res.end('');
              } else {
                res.writeHead(200, {});
                const renderHtml = installerOptions.renderHtmlForInstallPath !== undefined ?
                  installerOptions.renderHtmlForInstallPath :
                  defaultRenderHtmlForInstallPath;
                res.end(renderHtml(url));
                return;
              }
            } catch (err) {
              const e = err as any;
              throw new Error(e);
            }
          }
        }

        // Handle request for custom routes
        if (this.customRoutes.length) {
          const match = this.customRoutes.find((route) => {
            const isMethodMatch = Array.isArray(route.method) ?
              route.method.includes(method) : route.method === method;
            return route.path === req.url && isMethodMatch;
          });

          if (match) {
            match.callback(req, res);
            return;
          }
        }

        this.logger.info(`An unhandled HTTP request made to ${req.url} was ignored`);
        res.writeHead(404, {});
        res.end();
      });

      this.logger.debug(`Listening for HTTP requests on port ${port}`);

      if (this.installer) {
        this.logger.debug(`Go to http://localhost:${port}${installPath} to initiate OAuth flow`);
      }

      // use port 3000 by default
      server.listen(port);
    }

    this.client.on('slack_event', async ({ ack, body }) => {
      const event: ReceiverEvent = {
        body,
        ack,
      };
      await this.app?.processEvent(event);
    });
  }

  public init(app: App): void {
    this.app = app;
  }

  public start(): Promise<AppsConnectionsOpenResponse> {
    // start socket mode client
    return this.client.start();
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client.disconnect();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

function prepareCustomRoutes(customRoutes: CustomRoute[]): CustomRoute[] {
  const requiredKeys: (keyof CustomRoute)[] = ['path', 'method', 'callback'];
  const missingKeys: (keyof CustomRoute)[] = [];

  // Check for missing required keys
  customRoutes.forEach((route) => {
    requiredKeys.forEach((key) => {
      if (route[key] === undefined && !missingKeys.includes(key)) {
        missingKeys.push(key);
      }
    });
  });

  if (missingKeys.length > 0) {
    const errorMsg = `One or more members of customRoutes are missing required keys: ${missingKeys.join(', ')}`;
    throw new CustomRouteInitializationError(errorMsg);
  }

  // Convert methods to uppercase for ease of request processing
  const updatedRoutes = customRoutes.map((route) => {
    const method = Array.isArray(route.method) ?
      route.method.map((m) => m.toUpperCase()) : route.method.toUpperCase();
    return { ...route, method };
  });

  return updatedRoutes;
}
