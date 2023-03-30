import 'mocha';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { Logger, LogLevel } from '@slack/logger';
import { EventEmitter } from 'events';
import { InstallProvider } from '@slack/oauth';
import { IncomingMessage, ServerResponse } from 'http';
import { match } from 'path-to-regexp';
import { ParamsDictionary } from 'express-serve-static-core';
import { Override, mergeOverrides } from '../test-helpers';
import {
  AppInitializationError,
  CustomRouteInitializationError,
  HTTPReceiverDeferredRequestError,
} from '../errors';

/* Testing Harness */

// Loading the system under test using overrides
async function importHTTPReceiver(overrides: Override = {}): Promise<typeof import('./HTTPReceiver').default> {
  return (await rewiremock.module(() => import('./HTTPReceiver'), overrides)).default;
}

// Composable overrides
function withHttpCreateServer(spy: SinonSpy): Override {
  return {
    http: {
      createServer: spy,
    },
  };
}

function withHttpsCreateServer(spy: SinonSpy): Override {
  return {
    https: {
      createServer: spy,
    },
  };
}

// Fakes
class FakeServer extends EventEmitter {
  public on = sinon.fake();

  public listen = sinon.fake((_listenOptions: any, cb: any) => {
    if (this.listeningFailure !== undefined) {
      this.emit('error', this.listeningFailure);
    }
    cb();
  });

  public close = sinon.fake((...args: any[]) => {
    setImmediate(() => {
      this.emit('close');
      setImmediate(() => {
        args[0]();
      });
    });
  });

  public constructor(private listeningFailure?: Error) {
    super();
  }
}

describe('HTTPReceiver', function () {
  beforeEach(function () {
    this.listener = (_req: any, _res: any) => {};
    this.fakeServer = new FakeServer();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.fakeCreateServer = sinon.fake(function (_: any, handler: (req: any, res: any) => void) {
      that.listener = handler; // pick up the socket listener method so we can assert on its behaviour
      return that.fakeServer as FakeServer;
    });
  });

  const noopLogger: Logger = {
    debug(..._msg: any[]): void {
      /* noop */
    },
    info(..._msg: any[]): void {
      /* noop */
    },
    warn(..._msg: any[]): void {
      /* noop */
    },
    error(..._msg: any[]): void {
      /* noop */
    },
    setLevel(_level: LogLevel): void {
      /* noop */
    },
    getLevel(): LogLevel {
      return LogLevel.DEBUG;
    },
    setName(_name: string): void {
      /* noop */
    },
  };

  describe('constructor', function () {
    // NOTE: it would be more informative to test known valid combinations of options, as well as invalid combinations
    it('should accept supported arguments and use default arguments when not provided', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const HTTPReceiver = await importHTTPReceiver(overrides);

      const receiver = new HTTPReceiver({
        logger: noopLogger,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        signingSecret: 'secret',
        stateSecret: 'state-secret',
        scopes: ['channels:read'],
        installerOptions: {
          authVersion: 'v2',
          userScopes: ['chat:write'],
        },
        customPropertiesExtractor: (req) => ({ headers: req.headers }),
        dispatchErrorHandler: ({ error, logger, response }) => {
          logger.error(`An unhandled request detected: ${error}`);
          response.writeHead(500);
          response.write('Something is wrong!');
          response.end();
        },
        processEventErrorHandler: async ({ error, logger, response }) => {
          logger.error(`processEvent error: ${error}`);
          // acknowledge it anyway!
          response.writeHead(200);
          response.end();
          return true;
        },
        unhandledRequestHandler: ({ logger, response }) => {
          // acknowledge it anyway!
          logger.info('Acknowledging this incoming request because 2 seconds already passed...');
          response.writeHead(200);
          response.end();
        },
        unhandledRequestTimeoutMillis: 2000, // the default is 3001
      });
      assert.isNotNull(receiver);
    });

    it('should accept a custom port', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const HTTPReceiver = await importHTTPReceiver(overrides);

      const defaultPort = new HTTPReceiver({
        signingSecret: 'secret',
      });
      assert.isNotNull(defaultPort);
      assert.equal((defaultPort as any).port, 3000);

      const customPort = new HTTPReceiver({
        port: 9999,
        signingSecret: 'secret',
      });
      assert.isNotNull(customPort);
      assert.equal((customPort as any).port, 9999);

      const customPort2 = new HTTPReceiver({
        port: 7777,
        signingSecret: 'secret',
        installerOptions: {
          port: 9999,
        },
      });
      assert.isNotNull(customPort2);
      assert.equal((customPort2 as any).port, 9999);
    });

    it('should throw an error if redirect uri options supplied invalid or incomplete', async function () {
      const HTTPReceiver = await importHTTPReceiver();
      const clientId = 'my-clientId';
      const clientSecret = 'my-clientSecret';
      const signingSecret = 'secret';
      const stateSecret = 'my-stateSecret';
      const scopes = ['chat:write'];
      const redirectUri = 'http://example.com/heyo';
      const installerOptions = {
        redirectUriPath: '/heyo',
      };
      // correct format with redirect options supplied
      const receiver = new HTTPReceiver({
        clientId,
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri,
        installerOptions,
      });
      assert.isNotNull(receiver);
      // redirectUri supplied, but missing redirectUriPath
      assert.throws(() => new HTTPReceiver({
        clientId,
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri,
      }), AppInitializationError);
      // inconsistent redirectUriPath
      assert.throws(() => new HTTPReceiver({
        clientId: 'my-clientId',
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri,
        installerOptions: {
          redirectUriPath: '/hiya',
        },
      }), AppInitializationError);
      // inconsistent redirectUri
      assert.throws(() => new HTTPReceiver({
        clientId: 'my-clientId',
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri: 'http://example.com/hiya',
        installerOptions,
      }), AppInitializationError);
    });
  });
  describe('start() method', function () {
    it('should accept both numeric and string port arguments and correctly pass as number into server.listen method', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const HTTPReceiver = await importHTTPReceiver(overrides);

      const defaultPort = new HTTPReceiver({
        signingSecret: 'secret',
      });
      assert.isNotNull(defaultPort);
      assert.equal((defaultPort as any).port, 3000);
      await defaultPort.start(9001);
      assert.isTrue(this.fakeServer.listen.calledWith(9001));
      await defaultPort.stop();
      await defaultPort.start('1337');
      assert.isTrue(this.fakeServer.listen.calledWith(1337));
      await defaultPort.stop();
    });
  });
  describe('request handling', function () {
    describe('handleInstallPathRequest()', function () {
      it('should invoke installer handleInstallPath if a request comes into the install path', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const HTTPReceiver = await importHTTPReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const receiver = new HTTPReceiver({
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          stateSecret: 'state-secret',
          scopes,
          installerOptions: {
            authVersion: 'v2',
            installPath: '/hiya',
            metadata,
            userScopes,
          },
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/hiya';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        const end = sinon.fake();
        const setHeader = sinon.fake();
        fakeRes.writeHead = writeHead;
        fakeRes.end = end;
        fakeRes.setHeader = setHeader;
        await receiver.requestListener(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });

      it('should use a custom HTML renderer for the install path webpage', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const HTTPReceiver = await importHTTPReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const receiver = new HTTPReceiver({
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          stateSecret: 'state-secret',
          scopes,
          installerOptions: {
            authVersion: 'v2',
            installPath: '/hiya',
            renderHtmlForInstallPath: (_) => 'Hello world!',
            metadata,
            userScopes,
          },
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/hiya';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        const end = sinon.fake();
        fakeRes.writeHead = writeHead;
        fakeRes.end = end;
        /* eslint-disable-next-line @typescript-eslint/await-thenable */
        await receiver.requestListener(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });

      it('should redirect installers if directInstall is true', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const HTTPReceiver = await importHTTPReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const receiver = new HTTPReceiver({
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          stateSecret: 'state-secret',
          scopes,
          installerOptions: {
            authVersion: 'v2',
            installPath: '/hiya',
            directInstall: true,
            metadata,
            userScopes,
          },
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/hiya';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        const end = sinon.fake();
        fakeRes.writeHead = writeHead;
        fakeRes.end = end;
        await receiver.requestListener(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });
    });

    describe('handleInstallRedirectRequest()', function () {
      it('should invoke installer handler if a request comes into the redirect URI path', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider, {
          handleCallback: sinon.stub().resolves() as unknown as Promise<void>,
        });
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const HTTPReceiver = await importHTTPReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const callbackOptions = {};
        const receiver = new HTTPReceiver({
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          stateSecret: 'state-secret',
          scopes,
          redirectUri: 'http://example.com/heyo',
          installerOptions: {
            authVersion: 'v2',
            redirectUriPath: '/heyo',
            callbackOptions,
            metadata,
            userScopes,
          },
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/heyo';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        const end = sinon.fake();
        fakeRes.writeHead = writeHead;
        fakeRes.end = end;
        /* eslint-disable-next-line @typescript-eslint/await-thenable */
        await receiver.requestListener(fakeReq, fakeRes);
        assert(installProviderStub.handleCallback.calledWith(fakeReq, fakeRes, callbackOptions));
      });

      it('should invoke installer handler with installURLoptions supplied if state verification is off', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider, {
          handleCallback: sinon.stub().resolves() as unknown as Promise<void>,
        });
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const HTTPReceiver = await importHTTPReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const redirectUri = 'http://example.com/heyo';
        const callbackOptions = {};
        const installUrlOptions = {
          scopes,
          metadata,
          userScopes,
          redirectUri,
        };
        const receiver = new HTTPReceiver({
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          stateSecret: 'state-secret',
          scopes,
          redirectUri,
          installerOptions: {
            stateVerification: false,
            authVersion: 'v2',
            redirectUriPath: '/heyo',
            callbackOptions,
            metadata,
            userScopes,
          },
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/heyo';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        fakeRes.writeHead = sinon.fake();
        fakeRes.end = sinon.fake();
        await receiver.requestListener(fakeReq, fakeRes);
        sinon.assert.calledWith(
          installProviderStub.handleCallback, fakeReq, fakeRes, callbackOptions, installUrlOptions,
        );
      });
    });
    describe('custom route handling', async function () {
      it('should call custom route handler only if request matches route path and method', async function () {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches route path and method, ignoring query params', async function () {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test?hello=world';
        const tempMatch = matchRegex('/test');
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches route path and method including params', async function () {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [{ path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params', async function () {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [
          { path: '/test/123', method: ['get', 'POST'], handler: sinon.fake() },
          { path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params reverse order', async function () {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [
          { path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() },
          { path: '/test/123', method: ['get', 'POST'], handler: sinon.fake() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        assert(customRoutes[0].handler.calledWith({ ...fakeReq, params }, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it("should throw an error if customRoutes don't have the required keys", async function () {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [{ path: '/test' }] as any;

        assert.throws(() => new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        }), CustomRouteInitializationError);
      });
    });

    it("should throw if request doesn't match install path, redirect URI path, or custom routes", async function () {
      // Arrange
      const installProviderStub = sinon.createStubInstance(InstallProvider);
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const HTTPReceiver = await importHTTPReceiver(overrides);

      const metadata = 'this is bat country';
      const scopes = ['channels:read'];
      const userScopes = ['chat:write'];
      const customRoutes = [{ path: '/nope', method: 'POST', handler: sinon.fake() }];

      const receiver = new HTTPReceiver({
        logger: noopLogger,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        signingSecret: 'secret',
        stateSecret: 'state-secret',
        scopes,
        redirectUri: 'http://example.com/heyo',
        installerOptions: {
          authVersion: 'v2',
          installPath: '/hiya',
          redirectUriPath: '/heyo',
          metadata,
          userScopes,
        },
        customRoutes,
      });

      assert.isNotNull(receiver);
      receiver.installer = installProviderStub as unknown as InstallProvider;

      const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
      fakeReq.url = '/nope';
      fakeReq.method = 'GET';

      const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      fakeRes.writeHead = sinon.fake();
      fakeRes.end = sinon.fake();

      assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
    });
  });
});
