/* eslint-disable @typescript-eslint/no-explicit-any */
import { SocketModeClient } from '@slack/socket-mode';
import { createServer } from 'http';
import { Logger, ConsoleLogger, LogLevel } from '@slack/logger';
import { InstallProvider, CallbackOptions, InstallProviderOptions, InstallURLOptions } from '@slack/oauth';
import { AppsConnectionsOpenResponse } from '@slack/web-api';
import App from '../App';
import { Receiver, ReceiverEvent } from '../types';
import defaultRenderHtmlForInstallPath from './render-html-for-install-path';

// TODO: we throw away the key names for endpoints, so maybe we should use this interface. is it better for migrations?
// if that's the reason, let's document that with a comment.
export interface SocketModeReceiverOptions {
  logger?: Logger;
  logLevel?: LogLevel;
  clientId?: string;
  clientSecret?: string;
  stateSecret?: InstallProviderOptions['stateSecret']; // required when using default stateStore
  redirectUri?: string;
  installationStore?: InstallProviderOptions['installationStore']; // default MemoryInstallationStore
  scopes?: InstallURLOptions['scopes'];
  installerOptions?: InstallerOptions;
  appToken: string; // App Level Token
}

// Additional Installer Options
interface InstallerOptions {
  stateStore?: InstallProviderOptions['stateStore']; // default ClearStateStore
  stateVerification?: InstallProviderOptions['stateVerification']; // default true
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

  public constructor({
    appToken,
    logger = undefined,
    logLevel = LogLevel.INFO,
    clientId = undefined,
    clientSecret = undefined,
    stateSecret = undefined,
    redirectUri = undefined,
    installationStore = undefined,
    scopes = undefined,
    installerOptions = {},
  }: SocketModeReceiverOptions) {
    this.client = new SocketModeClient({
      appToken,
      logLevel,
      logger,
      clientOptions: installerOptions.clientOptions,
    });

    if (typeof logger !== 'undefined') {
      this.logger = logger;
    } else {
      this.logger = new ConsoleLogger();
      this.logger.setLevel(logLevel);
    }

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
        stateStore: installerOptions.stateStore,
        stateVerification: installerOptions.stateVerification,
        authVersion: installerOptions.authVersion ?? 'v2',
        clientOptions: installerOptions.clientOptions,
        authorizationUrl: installerOptions.authorizationUrl,
      });
    }

    // Add OAuth routes to receiver
    if (this.installer !== undefined) {
      // use default or passed in redirect path
      const redirectUriPath = installerOptions.redirectUriPath === undefined ? '/slack/oauth_redirect' : installerOptions.redirectUriPath;

      // use default or passed in installPath
      const installPath = installerOptions.installPath === undefined ? '/slack/install' : installerOptions.installPath;
      const directInstallEnabled = installerOptions.directInstall !== undefined && installerOptions.directInstall;

      // create install url options
      const installUrlOptions = {
        metadata: installerOptions.metadata,
        scopes: scopes ?? [],
        userScopes: installerOptions.userScopes,
        redirectUri,
      };
      const server = createServer(async (req, res) => {
        if (req.url !== undefined && req.url.startsWith(redirectUriPath)) {
          const { stateVerification, callbackOptions } = installerOptions;
          // call installer.handleCallback to wrap up the install flow
          if (stateVerification) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await this.installer!.handleCallback(req, res, callbackOptions);
          } else {
            // when stateVerification is disabled
            // make installation options directly available to installation handler
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await this.installer!.handleCallback(req, res, callbackOptions, installUrlOptions);
          }
        } else if (req.url !== undefined && req.url.startsWith(installPath)) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const url = await this.installer!.generateInstallUrl(installUrlOptions);
            if (directInstallEnabled) {
              res.writeHead(302, { Location: url });
              res.end('');
            } else {
              res.writeHead(200, {});
              const renderHtml = installerOptions.renderHtmlForInstallPath !== undefined ?
                installerOptions.renderHtmlForInstallPath :
                defaultRenderHtmlForInstallPath;
              res.end(renderHtml(url));
            }
          } catch (err) {
            const e = err as any;
            throw new Error(e);
          }
        } else {
          this.logger.error(`Tried to reach ${req.url} which isn't a valid route.`);
          // Return 404 because we don't support route
          res.writeHead(404, {});
          res.end(`route ${req.url} doesn't exist!`);
        }
      });

      const port = installerOptions.port === undefined ? 3000 : installerOptions.port;
      this.logger.debug(`listening on port ${port} for OAuth`);
      this.logger.debug(`Go to http://localhost:${port}${installPath} to initiate OAuth flow`);
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
