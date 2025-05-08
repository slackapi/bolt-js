import { IncomingMessage, ServerResponse } from 'node:http';
import { InstallProvider } from '@slack/oauth';
import { SocketModeClient } from '@slack/socket-mode';
import { assert } from 'chai';
import type { ParamsDictionary } from 'express-serve-static-core';
import { match } from 'path-to-regexp';
import rewiremock from 'rewiremock';
import sinon from 'sinon';
import App from '../../../src/App';
import { AppInitializationError, AuthorizationError, CustomRouteInitializationError } from '../../../src/errors';
import type { ReceiverEvent } from '../../../src/types';
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
async function importSocketModeReceiver(
  overrides: Override = {},
): Promise<typeof import('../../../src/receivers/SocketModeReceiver').default> {
  return (await rewiremock.module(() => import('../../../src/receivers/SocketModeReceiver'), overrides)).default;
}

describe('SocketModeReceiver', () => {
  let socketModeHttpServerHandler: typeof noopVoid;
  let fakeServer: FakeServer;
  let fakeCreateServer: sinon.SinonSpy;
  const noopLogger = createFakeLogger();
  let overrides: Override;
  beforeEach(() => {
    fakeServer = new FakeServer();
    fakeCreateServer = sinon.fake((handler: typeof noopVoid) => {
      socketModeHttpServerHandler = handler; // pick up the socket-mode receiver's HTTP request handler so we can assert on its behaviour
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
      const SocketModeReceiver = await importSocketModeReceiver(overrides);

      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        stateSecret: 'state-secret',
        scopes: ['channels:read'],
        installerOptions: {
          authVersion: 'v2',
          userScopes: ['chat:write'],
        },
      });
      assert.isNotNull(receiver);
    });
    it('should allow for customizing port the socket listens on', async () => {
      const SocketModeReceiver = await importSocketModeReceiver(overrides);

      const customPort = 1337;
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        stateSecret: 'state-secret',
        scopes: ['channels:read'],
        installerOptions: {
          authVersion: 'v2',
          userScopes: ['chat:write'],
          port: customPort,
        },
      });
      assert.isNotNull(receiver);
    });
    it('should allow for extracting additional values from Socket Mode messages', async () => {
      const SocketModeReceiver = await importSocketModeReceiver(overrides);

      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        customPropertiesExtractor: ({ type, body }) => ({ payload_type: type, body }),
      });
      assert.isNotNull(receiver);
    });
    it('should throw an error if redirect uri options supplied invalid or incomplete', async () => {
      const SocketModeReceiver = await importSocketModeReceiver(overrides);
      const clientId = 'my-clientId';
      const clientSecret = 'my-clientSecret';
      const stateSecret = 'my-stateSecret';
      const scopes = ['chat:write'];
      const appToken = 'my-secret';
      const redirectUri = 'http://example.com/heyo';
      const installerOptions = {
        redirectUriPath: '/heyo',
      };
      // correct format with full redirect options supplied
      const receiver = new SocketModeReceiver({
        appToken,
        clientId,
        clientSecret,
        stateSecret,
        scopes,
        redirectUri,
        installerOptions,
      });
      assert.isNotNull(receiver);
      // redirectUri supplied, but no redirectUriPath
      assert.throws(
        () =>
          new SocketModeReceiver({
            appToken,
            clientId,
            clientSecret,
            stateSecret,
            scopes,
            redirectUri,
          }),
        AppInitializationError,
      );
      // inconsistent redirectUriPath
      assert.throws(
        () =>
          new SocketModeReceiver({
            appToken,
            clientId: 'my-clientId',
            clientSecret,
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
          new SocketModeReceiver({
            appToken,
            clientId: 'my-clientId',
            clientSecret,
            stateSecret,
            scopes,
            redirectUri: 'http://example.com/hiya',
            installerOptions,
          }),
        AppInitializationError,
      );
    });
  });
  describe('request handling', () => {
    it('should return a 404 if a request flows through the install path, redirect URI path and custom routes without being handled', async () => {
      const installProviderStub = sinon.createStubInstance(InstallProvider);
      const SocketModeReceiver = await importSocketModeReceiver(overrides);

      const metadata = 'this is bat country';
      const scopes = ['channels:read'];
      const userScopes = ['chat:write'];
      const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        stateSecret: 'state-secret',
        scopes,
        customRoutes,
        redirectUri: 'http://example.com/heyo',
        installerOptions: {
          authVersion: 'v2',
          installPath: '/hiya',
          redirectUriPath: '/heyo',
          metadata,
          userScopes,
        },
      });
      assert.isNotNull(receiver);
      receiver.installer = installProviderStub as unknown as InstallProvider;
      const fakeReq = sinon.createStubInstance(IncomingMessage);
      fakeReq.url = '/nope';
      fakeReq.method = 'GET';
      const fakeRes = sinon.createStubInstance(ServerResponse);
      await socketModeHttpServerHandler(fakeReq, fakeRes);
      sinon.assert.calledWith(fakeRes.writeHead, 404, sinon.match.object);
      assert(fakeRes.end.calledOnce);
    });
    describe('handleInstallPathRequest()', () => {
      it('should invoke installer handleInstallPath if a request comes into the install path', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
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
        const fakeReq = {
          url: '/hiya',
          method: 'GET',
        } as IncomingMessage;
        const fakeRes = {
          writeHead: sinon.fake(),
          end: sinon.fake(),
        } as unknown as ServerResponse;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });
      it('should use a custom HTML renderer for the install path webpage', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
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
        const fakeReq = {
          url: '/hiya',
          method: 'GET',
        } as IncomingMessage;
        const fakeRes = {
          writeHead: sinon.fake(),
          end: sinon.fake(),
        } as unknown as ServerResponse;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });
      it('should redirect installers if directInstall is true', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);

        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const userScopes = ['chat:write'];
        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
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
        const fakeReq = {
          url: '/hiya',
          method: 'GET',
        } as IncomingMessage;
        const fakeRes = {
          writeHead: sinon.fake(),
          end: sinon.fake(),
        } as unknown as ServerResponse;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });
    });
    describe('handleInstallRedirectRequest()', () => {
      it('should invoke installer handleCallback if a request comes into the redirect URI path', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);

        const callbackOptions = {
          failure: () => {},
          success: () => {},
        };
        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          stateSecret: 'state-secret',
          scopes: ['channels:read'],
          redirectUri: 'http://example.com/heyo',
          installerOptions: {
            stateVerification: true,
            authVersion: 'v2',
            userScopes: ['chat:write'],
            redirectUriPath: '/heyo',
            callbackOptions,
          },
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = {
          url: '/heyo',
          method: 'GET',
        };
        const fakeRes = null;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(
          installProviderStub.handleCallback.calledWith(
            fakeReq as IncomingMessage,
            fakeRes as unknown as ServerResponse,
            callbackOptions,
          ),
        );
      });
      it('should invoke handleCallback with installURLoptions as params if state verification is off', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const metadata = 'this is bat country';
        const scopes = ['channels:read'];
        const redirectUri = 'http://example.com/heyo';
        const userScopes = ['chat:write'];
        const callbackOptions = {
          failure: () => {},
          success: () => {},
        };
        const installUrlOptions = {
          scopes,
          metadata,
          userScopes,
          redirectUri,
        };
        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          stateSecret: 'state-secret',
          scopes,
          redirectUri,
          installerOptions: {
            stateVerification: false,
            authVersion: 'v2',
            redirectUriPath: '/heyo',
            callbackOptions,
            userScopes: ['chat:write'],
            metadata,
          },
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = sinon.createStubInstance(IncomingMessage);
        fakeReq.url = '/heyo';
        fakeReq.headers = { host: 'localhost' };
        fakeReq.method = 'GET';
        const fakeRes = sinon.createStubInstance(ServerResponse);
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        sinon.assert.calledWith(
          installProviderStub.handleCallback,
          fakeReq as IncomingMessage,
          fakeRes as unknown as ServerResponse,
          callbackOptions,
          installUrlOptions,
        );
      });
    });
    describe('custom route handling', () => {
      it('should call custom route handler only if request matches route path and method', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = sinon.createStubInstance(IncomingMessage);
        const fakeRes = sinon.createStubInstance(ServerResponse);

        fakeReq.url = '/test';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler when request matches path, ignoring query params', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = sinon.createStubInstance(IncomingMessage);
        const fakeRes = sinon.createStubInstance(ServerResponse);

        fakeReq.url = '/test?hello=world';
        const tempMatch = matchRegex('/test');
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler only if request matches route path and method including params', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = sinon.createStubInstance(IncomingMessage);
        const fakeRes = sinon.createStubInstance(ServerResponse);

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [
          { path: '/test/123', method: ['get', 'POST'], handler: sinon.fake() },
          { path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = sinon.createStubInstance(IncomingMessage);
        const fakeRes = sinon.createStubInstance(ServerResponse);

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params reverse order', async () => {
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [
          { path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() },
          { path: '/test/123', method: ['get', 'POST'], handler: sinon.fake() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = sinon.createStubInstance(IncomingMessage);
        const fakeRes = sinon.createStubInstance(ServerResponse);

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it("should throw an error if customRoutes don't have the required keys", async () => {
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        // biome-ignore lint/suspicious/noExplicitAny: typing as any to intentionally have missing required keys
        const customRoutes = [{ handler: sinon.fake() }] as any;

        assert.throws(
          () => new SocketModeReceiver({ appToken: 'my-secret', customRoutes }),
          CustomRouteInitializationError,
        );
      });
    });
  });

  describe('#start()', () => {
    it('should invoke the SocketModeClient start method', async () => {
      const clientStub = sinon.createStubInstance(SocketModeClient);
      const SocketModeReceiver = await importSocketModeReceiver(overrides);

      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        stateSecret: 'state-secret',
        scopes: ['channels:read'],
        installerOptions: {
          authVersion: 'v2',
          userScopes: ['chat:write'],
        },
      });
      assert.isNotNull(receiver);
      receiver.client = clientStub as unknown as SocketModeClient;
      await receiver.start();
      assert(clientStub.start.called);
    });
  });

  describe('#stop()', () => {
    it('should invoke the SocketModeClient disconnect method', async () => {
      const clientStub = sinon.createStubInstance(SocketModeClient);
      const SocketModeReceiver = await importSocketModeReceiver(overrides);

      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        stateSecret: 'state-secret',
        scopes: ['channels:read'],
        installerOptions: {
          authVersion: 'v2',
          userScopes: ['chat:write'],
        },
      });
      assert.isNotNull(receiver);
      receiver.client = clientStub as unknown as SocketModeClient;
      await receiver.stop();
      assert(clientStub.disconnect.called);
    });
  });

  describe('event', () => {
    it('acknowledges processed events', async () => {
      const processStub = sinon.stub<[ReceiverEvent]>().resolves();
      processStub.callsFake(async (event: ReceiverEvent) => {
        await event.ack();
      });
      const app = sinon.createStubInstance(App, { processEvent: processStub }) as unknown as App;
      const SocketModeReceiver = await importSocketModeReceiver(overrides);
      const receiver = new SocketModeReceiver({ appToken: 'xapp-example' });
      receiver.init(app);

      // Stub ack with an awaited promise for tests
      let resolve: () => void;
      const called = new Promise<void>((r) => {
        resolve = r;
      });
      const ack = sinon.stub().callsFake(async () => {
        resolve();
      });

      receiver.client.emit('slack_event', { ack });
      await called;
      assert.isTrue(ack.called);
    });

    it('acknowledges erroring events', async () => {
      const processStub = sinon.stub<[ReceiverEvent]>().resolves();
      processStub.callsFake(async (_) => {
        throw new AuthorizationError('brokentoken', new Error());
      });
      const app = sinon.createStubInstance(App, { processEvent: processStub }) as unknown as App;
      const SocketModeReceiver = await importSocketModeReceiver(overrides);
      const receiver = new SocketModeReceiver({ appToken: 'xapp-example' });
      receiver.init(app);

      // Stub ack with an awaited promise for tests
      let resolve: () => void;
      const called = new Promise<void>((r) => {
        resolve = r;
      });
      const ack = sinon.stub().callsFake(async () => {
        resolve();
      });

      receiver.client.emit('slack_event', { ack });
      await called;
      assert.isTrue(ack.called);
    });
  });
});
