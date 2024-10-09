import { IncomingMessage, ServerResponse } from 'node:http';
import { InstallProvider } from '@slack/oauth';
import { assert } from 'chai';
import type { ParamsDictionary } from 'express-serve-static-core';
import { match } from 'path-to-regexp';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import {
  AppInitializationError,
  CustomRouteInitializationError,
  HTTPReceiverDeferredRequestError,
} from '../../../src/errors';
import type { CustomRoute } from '../../../src/receivers/custom-routes';
import {
  FakeServer,
  type Override,
  createFakeLogger,
  mergeOverrides,
  type noopVoid,
  withHttpCreateServer,
  withHttpsCreateServer,
} from '../helpers';

// Loading the system under test using overrides
async function importHTTPReceiver(
  overrides: Override = {},
): Promise<typeof import('../../../src/receivers/HTTPReceiver').default> {
  return (await rewiremock.module(() => import('../../../src/receivers/HTTPReceiver'), overrides)).default;
}

describe('HTTPReceiver', () => {
  // TODO: we pick up the socket listener method so we can assert on its behaviour; probably should add tests for it then
  // let httpRequestListener: typeof noopVoid;
  let fakeServer: FakeServer;
  let fakeCreateServer: sinon.SinonSpy;
  const noopLogger = createFakeLogger();
  let overrides: Override;
  beforeEach(() => {
    fakeServer = new FakeServer();
    fakeCreateServer = sinon.fake((_options: Record<string, unknown>, _handler: typeof noopVoid) => {
      // TODO: we pick up the socket listener method so we can assert on its behaviour; probably should add tests for it then
      // httpRequestListener = _handler;
      return fakeServer;
    });
    overrides = mergeOverrides(
      withHttpCreateServer(fakeCreateServer),
      withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
    );
  });

  describe('constructor', () => {
    // NOTE: it would be more informative to test known valid combinations of options, as well as invalid combinations
    it('should accept supported arguments and use default arguments when not provided', async () => {
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

    it('should accept a custom port', async () => {
      const HTTPReceiver = await importHTTPReceiver(overrides);

      const defaultPort = new HTTPReceiver({
        signingSecret: 'secret',
      });
      assert.isNotNull(defaultPort);
      assert.propertyVal(defaultPort, 'port', 3000);

      const customPort = new HTTPReceiver({
        port: 9999,
        signingSecret: 'secret',
      });
      assert.isNotNull(customPort);
      assert.propertyVal(customPort, 'port', 9999);

      const customPort2 = new HTTPReceiver({
        port: 7777,
        signingSecret: 'secret',
        installerOptions: {
          port: 9999,
        },
      });
      assert.isNotNull(customPort2);
      assert.propertyVal(customPort2, 'port', 9999);
    });

    it('should throw an error if redirect uri options supplied invalid or incomplete', async () => {
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
      assert.throws(
        () =>
          new HTTPReceiver({
            clientId,
            clientSecret,
            signingSecret,
            stateSecret,
            scopes,
            redirectUri,
          }),
        AppInitializationError,
      );
      // inconsistent redirectUriPath
      assert.throws(
        () =>
          new HTTPReceiver({
            clientId: 'my-clientId',
            clientSecret,
            signingSecret,
            stateSecret,
            scopes,
            redirectUri,
            installerOptions: {
              redirectUriPath: '/hiya',
            },
          }),
        AppInitializationError,
      );
      // inconsistent redirectUri
      assert.throws(
        () =>
          new HTTPReceiver({
            clientId: 'my-clientId',
            clientSecret,
            signingSecret,
            stateSecret,
            scopes,
            redirectUri: 'http://example.com/hiya',
            installerOptions,
          }),
        AppInitializationError,
      );
    });
  });
  describe('start() method', () => {
    it('should accept both numeric and string port arguments and correctly pass as number into server.listen method', async () => {
      const HTTPReceiver = await importHTTPReceiver(overrides);

      const defaultPort = new HTTPReceiver({
        signingSecret: 'secret',
      });
      assert.isNotNull(defaultPort);
      assert.propertyVal(defaultPort, 'port', 3000);
      await defaultPort.start(9001);
      sinon.assert.calledWith(fakeServer.listen, 9001);
      await defaultPort.stop();
      fakeServer.listen.resetHistory();
      await defaultPort.start('1337');
      sinon.assert.calledWith(fakeServer.listen, 1337);
      await defaultPort.stop();
    });
  });
  describe('request handling', () => {
    describe('handleInstallPathRequest()', () => {
      it('should invoke installer handleInstallPath if a request comes into the install path', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
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
        const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/hiya';
        fakeReq.method = 'GET';
        const fakeRes = sinon.createStubInstance(ServerResponse);
        receiver.requestListener(fakeReq, fakeRes as unknown as ServerResponse);
        sinon.assert.calledWith(installProviderStub.handleInstallPath, fakeReq, fakeRes);
      });

      it('should use a custom HTML renderer for the install path webpage', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
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
        receiver.requestListener(fakeReq, fakeRes);
        sinon.assert.calledWith(installProviderStub.handleInstallPath, fakeReq, fakeRes);
      });

      it('should redirect installers if directInstall is true', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
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
        receiver.requestListener(fakeReq, fakeRes);
        sinon.assert.calledWith(installProviderStub.handleInstallPath, fakeReq, fakeRes);
      });
    });

    describe('handleInstallRedirectRequest()', () => {
      it('should invoke installer handler if a request comes into the redirect URI path', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider, {
          handleCallback: sinon.stub().resolves() as unknown as Promise<void>,
        });
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
        const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/heyo';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        receiver.requestListener(fakeReq, fakeRes);
        sinon.assert.calledWith(installProviderStub.handleCallback, fakeReq, fakeRes, callbackOptions);
      });

      it('should invoke installer handler with installURLoptions supplied if state verification is off', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider, {
          handleCallback: sinon.stub().resolves() as unknown as Promise<void>,
        });
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
        const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/heyo';
        fakeReq.method = 'GET';
        const fakeRes = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        receiver.requestListener(fakeReq, fakeRes);
        sinon.assert.calledWith(
          installProviderStub.handleCallback,
          fakeReq,
          fakeRes,
          callbackOptions,
          installUrlOptions,
        );
      });
    });
    describe('custom route handling', async () => {
      it('should call custom route handler only if request matches route path and method', async () => {
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
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches route path and method, ignoring query params', async () => {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test?hello=world';
        const tempMatch = matchRegex('/test');
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches route path and method including params', async () => {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [{ path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params', async () => {
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

        const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);
        sinon.assert.notCalled(customRoutes[1].handler);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params reverse order', async () => {
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

        const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);
        sinon.assert.notCalled(customRoutes[1].handler);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        sinon.assert.calledWith(customRoutes[0].handler, expectedMessage, fakeRes);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it("should throw an error if customRoutes don't have the required keys", async () => {
        const HTTPReceiver = await importHTTPReceiver();
        const customRoutes = [{ path: '/test' }] as CustomRoute[];

        assert.throws(
          () =>
            new HTTPReceiver({
              clientSecret: 'my-client-secret',
              signingSecret: 'secret',
              customRoutes,
            }),
          CustomRouteInitializationError,
        );
      });
    });

    it("should throw if request doesn't match install path, redirect URI path, or custom routes", async () => {
      const installProviderStub = sinon.createStubInstance(InstallProvider);
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

      const fakeReq = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
      fakeReq.url = '/nope';
      fakeReq.method = 'GET';

      const fakeRes = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;

      assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
    });
  });
});
