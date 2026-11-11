import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { beforeEach, describe, it, mock } from 'node:test';
import { InstallProvider } from '@slack/oauth';
import { SocketModeClient } from '@slack/socket-mode';
import type { ParamsDictionary } from 'express-serve-static-core';
import { match } from 'path-to-regexp';
import { Agent } from 'undici';
import App from '../../../src/App';
import { AppInitializationError, AuthorizationError, CustomRouteInitializationError } from '../../../src/errors';
import { defaultProcessEventErrorHandler } from '../../../src/receivers/SocketModeFunctions';
import type { ReceiverEvent } from '../../../src/types';
import {
  createFakeLogger,
  delay,
  FakeServer,
  type MockFn,
  mergeOverrides,
  mockInstance,
  type noopVoid,
  type Override,
  proxyquire,
  withHttpCreateServer,
  withHttpsCreateServer,
} from '../helpers';

// Loading the system under test using overrides
function importSocketModeReceiver(
  overrides: Override = {},
): typeof import('../../../src/receivers/SocketModeReceiver').default {
  const absolutePath = path.resolve(__dirname, '../../../src/receivers/SocketModeReceiver');
  return proxyquire(absolutePath, overrides).default;
}

describe('SocketModeReceiver', () => {
  let socketModeHttpServerHandler: typeof noopVoid;
  let fakeServer: FakeServer;
  let fakeCreateServer: MockFn;
  const noopLogger = createFakeLogger();
  let overrides: Override;
  beforeEach(() => {
    fakeServer = new FakeServer();
    fakeCreateServer = mock.fn((handler: typeof noopVoid) => {
      socketModeHttpServerHandler = handler; // pick up the socket-mode receiver's HTTP request handler so we can assert on its behaviour
      return fakeServer;
    });
    overrides = mergeOverrides(
      withHttpCreateServer(fakeCreateServer),
      withHttpsCreateServer(
        mock.fn(() => {
          throw new Error('Should not be used.');
        }),
      ),
    );
  });

  describe('constructor', () => {
    // NOTE: it would be more informative to test known valid combinations of options, as well as invalid combinations
    it('should accept supported arguments and use default arguments when not provided', async () => {
      const SocketModeReceiver = importSocketModeReceiver(overrides);

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
      assert.notStrictEqual(receiver, null);
    });
    it('should allow for customizing port the socket listens on', async () => {
      const SocketModeReceiver = importSocketModeReceiver(overrides);

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
      assert.notStrictEqual(receiver, null);
    });
    it('should allow for extracting additional values from Socket Mode messages', async () => {
      const SocketModeReceiver = importSocketModeReceiver(overrides);

      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        customPropertiesExtractor: ({ type, body }) => ({ payload_type: type, body }),
      });
      assert.notStrictEqual(receiver, null);
    });
    it('should pass clientPingTimeout to SocketModeClient', async () => {
      const constructorSpy = mock.fn();
      class FakeSocketModeClient extends EventEmitter {
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        constructor(opts: any) {
          super();
          constructorSpy(opts);
        }
      }
      const smOverrides = mergeOverrides(overrides, {
        '@slack/socket-mode': {
          SocketModeClient: FakeSocketModeClient,
        },
      });
      const SocketModeReceiver = importSocketModeReceiver(smOverrides);
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        clientPingTimeout: 15000,
      });
      assert.notStrictEqual(receiver, null);
      assert.strictEqual(constructorSpy.mock.callCount(), 1);
      const constructorArgs = constructorSpy.mock.calls[0].arguments[0];
      assert.equal(constructorArgs.clientPingTimeout, 15000);
    });
    it('should pass serverPingTimeout to SocketModeClient', async () => {
      const constructorSpy = mock.fn();
      class FakeSocketModeClient extends EventEmitter {
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        constructor(opts: any) {
          super();
          constructorSpy(opts);
        }
      }
      const smOverrides = mergeOverrides(overrides, {
        '@slack/socket-mode': {
          SocketModeClient: FakeSocketModeClient,
        },
      });
      const SocketModeReceiver = importSocketModeReceiver(smOverrides);
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        serverPingTimeout: 60000,
      });
      assert.notStrictEqual(receiver, null);
      assert.strictEqual(constructorSpy.mock.callCount(), 1);
      const constructorArgs = constructorSpy.mock.calls[0].arguments[0];
      assert.equal(constructorArgs.serverPingTimeout, 60000);
    });
    it('should pass dispatcher to SocketModeClient', async () => {
      const constructorSpy = mock.fn();
      class FakeSocketModeClient extends EventEmitter {
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        constructor(opts: any) {
          super();
          constructorSpy(opts);
        }
      }
      const smOverrides = mergeOverrides(overrides, {
        '@slack/socket-mode': {
          SocketModeClient: FakeSocketModeClient,
        },
      });
      const SocketModeReceiver = importSocketModeReceiver(smOverrides);
      const dispatcher = new Agent();
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        dispatcher,
      });
      assert.notStrictEqual(receiver, null);
      assert.strictEqual(constructorSpy.mock.callCount(), 1);
      const constructorArgs = constructorSpy.mock.calls[0].arguments[0];
      assert.strictEqual(constructorArgs.dispatcher, dispatcher);
    });
    it('should construct a SocketModeClient with an undici dispatcher', async () => {
      const SocketModeReceiver = importSocketModeReceiver(overrides);
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        dispatcher: new Agent(),
      });
      assert.ok(receiver.client instanceof SocketModeClient);
    });
    it('should pass all socket mode timeout options to SocketModeClient', async () => {
      const constructorSpy = mock.fn();
      class FakeSocketModeClient extends EventEmitter {
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        constructor(opts: any) {
          super();
          constructorSpy(opts);
        }
      }
      const smOverrides = mergeOverrides(overrides, {
        '@slack/socket-mode': {
          SocketModeClient: FakeSocketModeClient,
        },
      });
      const SocketModeReceiver = importSocketModeReceiver(smOverrides);
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        clientPingTimeout: 15000,
        serverPingTimeout: 60000,
        pingPongLoggingEnabled: true,
        autoReconnectEnabled: false,
      });
      assert.notStrictEqual(receiver, null);
      assert.strictEqual(constructorSpy.mock.callCount(), 1);
      const constructorArgs = constructorSpy.mock.calls[0].arguments[0];
      assert.equal(constructorArgs.clientPingTimeout, 15000);
      assert.equal(constructorArgs.serverPingTimeout, 60000);
      assert.equal(constructorArgs.pingPongLoggingEnabled, true);
      assert.equal(constructorArgs.autoReconnectEnabled, false);
    });
    it('should use defaults when socket mode timeout options are not provided', async () => {
      const constructorSpy = mock.fn();
      class FakeSocketModeClient extends EventEmitter {
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        constructor(opts: any) {
          super();
          constructorSpy(opts);
        }
      }
      const smOverrides = mergeOverrides(overrides, {
        '@slack/socket-mode': {
          SocketModeClient: FakeSocketModeClient,
        },
      });
      const SocketModeReceiver = importSocketModeReceiver(smOverrides);
      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
      });
      assert.notStrictEqual(receiver, null);
      assert.strictEqual(constructorSpy.mock.callCount(), 1);
      const constructorArgs = constructorSpy.mock.calls[0].arguments[0];
      assert.equal(constructorArgs.appToken, 'my-secret');
      assert.strictEqual(constructorArgs.clientPingTimeout, undefined);
      assert.strictEqual(constructorArgs.serverPingTimeout, undefined);
      assert.strictEqual(constructorArgs.pingPongLoggingEnabled, undefined);
      assert.strictEqual(constructorArgs.autoReconnectEnabled, undefined);
    });
    it('should throw an error if redirect uri options supplied invalid or incomplete', async () => {
      const SocketModeReceiver = importSocketModeReceiver(overrides);
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
      assert.notStrictEqual(receiver, null);
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
      const installProviderStub = mockInstance(InstallProvider);
      const SocketModeReceiver = importSocketModeReceiver(overrides);

      const metadata = 'this is bat country';
      const scopes = ['channels:read'];
      const userScopes = ['chat:write'];
      const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: mock.fn() }];
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
      assert.notStrictEqual(receiver, null);
      receiver.installer = installProviderStub as unknown as InstallProvider;
      const fakeReq = mockInstance(IncomingMessage);
      fakeReq.url = '/nope';
      fakeReq.method = 'GET';
      const fakeRes = mockInstance(ServerResponse);
      await socketModeHttpServerHandler(fakeReq, fakeRes);
      assert.strictEqual(fakeRes.writeHead.mock.calls[0].arguments[0], 404);
      assert.strictEqual(typeof fakeRes.writeHead.mock.calls[0].arguments[1], 'object');
      assert.strictEqual(fakeRes.end.mock.callCount(), 1);
    });
    describe('handleInstallPathRequest()', () => {
      it('should invoke installer handleInstallPath if a request comes into the install path', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = {
          url: '/hiya',
          method: 'GET',
        } as IncomingMessage;
        const fakeRes = {
          writeHead: mock.fn(),
          end: mock.fn(),
        } as unknown as ServerResponse;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleInstallPath.mock.calls[0].arguments.slice(0, 2), [
          fakeReq,
          fakeRes,
        ]);
      });
      it('should use a custom HTML renderer for the install path webpage', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = {
          url: '/hiya',
          method: 'GET',
        } as IncomingMessage;
        const fakeRes = {
          writeHead: mock.fn(),
          end: mock.fn(),
        } as unknown as ServerResponse;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleInstallPath.mock.calls[0].arguments.slice(0, 2), [
          fakeReq,
          fakeRes,
        ]);
      });
      it('should redirect installers if directInstall is true', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = {
          url: '/hiya',
          method: 'GET',
        } as IncomingMessage;
        const fakeRes = {
          writeHead: mock.fn(),
          end: mock.fn(),
        } as unknown as ServerResponse;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleInstallPath.mock.calls[0].arguments.slice(0, 2), [
          fakeReq,
          fakeRes,
        ]);
      });
    });
    describe('handleInstallRedirectRequest()', () => {
      it('should invoke installer handleCallback if a request comes into the redirect URI path', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = {
          url: '/heyo',
          method: 'GET',
        };
        const fakeRes = null;
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleCallback.mock.calls[0].arguments.slice(0, 3), [
          fakeReq as IncomingMessage,
          fakeRes as unknown as ServerResponse,
          callbackOptions,
        ]);
      });
      it('should invoke handleCallback with installURLoptions as params if state verification is off', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);
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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = mockInstance(IncomingMessage);
        fakeReq.url = '/heyo';
        fakeReq.headers = { host: 'localhost' };
        fakeReq.method = 'GET';
        const fakeRes = mockInstance(ServerResponse);
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleCallback.mock.calls[0].arguments, [
          fakeReq as IncomingMessage,
          fakeRes as unknown as ServerResponse,
          callbackOptions,
          installUrlOptions,
        ]);
      });
    });
    describe('custom route handling', () => {
      it('should call custom route handler only if request matches route path and method', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: mock.fn() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = mockInstance(IncomingMessage);
        const fakeRes = mockInstance(ServerResponse);

        fakeReq.url = '/test';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.strictEqual(fakeRes.writeHead.mock.calls[0].arguments[0], 404);
        assert.strictEqual(typeof fakeRes.writeHead.mock.calls[0].arguments[1], 'object');
        assert.ok(fakeRes.end.mock.callCount() > 0);
      });

      it('should call custom route handler when request matches path, ignoring query params', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: mock.fn() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = mockInstance(IncomingMessage);
        const fakeRes = mockInstance(ServerResponse);

        fakeReq.url = '/test?hello=world';
        const tempMatch = matchRegex('/test');
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.strictEqual(fakeRes.writeHead.mock.calls[0].arguments[0], 404);
        assert.strictEqual(typeof fakeRes.writeHead.mock.calls[0].arguments[1], 'object');
        assert.ok(fakeRes.end.mock.callCount() > 0);
      });

      it('should call custom route handler only if request matches route path and method including params', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test/:id', method: ['get', 'POST'], handler: mock.fn() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = mockInstance(IncomingMessage);
        const fakeRes = mockInstance(ServerResponse);

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.strictEqual(fakeRes.writeHead.mock.calls[0].arguments[0], 404);
        assert.strictEqual(typeof fakeRes.writeHead.mock.calls[0].arguments[1], 'object');
        assert.ok(fakeRes.end.mock.callCount() > 0);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);
        const customRoutes = [
          { path: '/test/123', method: ['get', 'POST'], handler: mock.fn() },
          { path: '/test/:id', method: ['get', 'POST'], handler: mock.fn() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = mockInstance(IncomingMessage);
        const fakeRes = mockInstance(ServerResponse);

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, params);
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);
        assert.strictEqual(customRoutes[1].handler.mock.callCount(), 0);

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, params);
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);
        assert.strictEqual(customRoutes[1].handler.mock.callCount(), 0);

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.strictEqual(fakeRes.writeHead.mock.calls[0].arguments[0], 404);
        assert.strictEqual(typeof fakeRes.writeHead.mock.calls[0].arguments[1], 'object');
        assert.ok(fakeRes.end.mock.callCount() > 0);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params reverse order', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const SocketModeReceiver = importSocketModeReceiver(overrides);
        const customRoutes = [
          { path: '/test/:id', method: ['get', 'POST'], handler: mock.fn() },
          { path: '/test/123', method: ['get', 'POST'], handler: mock.fn() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq = mockInstance(IncomingMessage);
        const fakeRes = mockInstance(ServerResponse);

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, params);
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);
        assert.strictEqual(customRoutes[1].handler.mock.callCount(), 0);

        fakeReq.method = 'POST';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, params);
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments.slice(0, 2), [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        await socketModeHttpServerHandler(fakeReq, fakeRes);
        assert.strictEqual(fakeRes.writeHead.mock.calls[0].arguments[0], 404);
        assert.strictEqual(typeof fakeRes.writeHead.mock.calls[0].arguments[1], 'object');
        assert.ok(fakeRes.end.mock.callCount() > 0);
      });

      it("should throw an error if customRoutes don't have the required keys", async () => {
        const SocketModeReceiver = importSocketModeReceiver(overrides);
        // biome-ignore lint/suspicious/noExplicitAny: typing as any to intentionally have missing required keys
        const customRoutes = [{ handler: mock.fn() }] as any;

        assert.throws(
          () => new SocketModeReceiver({ appToken: 'my-secret', customRoutes }),
          CustomRouteInitializationError,
        );
      });
    });
  });

  describe('#start()', () => {
    it('should invoke the SocketModeClient start method', async () => {
      const clientStub = mockInstance(SocketModeClient);
      const SocketModeReceiver = importSocketModeReceiver(overrides);

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
      assert.notStrictEqual(receiver, null);
      receiver.client = clientStub as unknown as SocketModeClient;
      await receiver.start();
      assert.ok(clientStub.start.mock.callCount() > 0);
    });
  });

  describe('#stop()', () => {
    it('should invoke the SocketModeClient disconnect method', async () => {
      const clientStub = mockInstance(SocketModeClient);
      const SocketModeReceiver = importSocketModeReceiver(overrides);

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
      assert.notStrictEqual(receiver, null);
      receiver.client = clientStub as unknown as SocketModeClient;
      await receiver.stop();
      assert.ok(clientStub.disconnect.mock.callCount() > 0);
    });
  });

  describe('event', () => {
    it('should allow events processed to be acknowledged', async () => {
      const processStub = mock.fn(async (event: ReceiverEvent) => {
        await event.ack();
      });
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      const SocketModeReceiver = importSocketModeReceiver(overrides);
      const receiver = new SocketModeReceiver({ appToken: 'xapp-example' });
      receiver.init(app);

      // Stub ack with an awaited promise for tests
      let notifyAckCalled: () => void;
      const ackCalled = new Promise<void>((resolve) => {
        notifyAckCalled = resolve;
      });
      const ack = mock.fn(async () => {
        notifyAckCalled();
      });

      receiver.client.emit('slack_event', { ack });
      await ackCalled;
      assert.strictEqual(ack.mock.callCount(), 1);
    });

    it('acknowledges events that throw AuthorizationError', async () => {
      const processStub = mock.fn(() => {
        throw new AuthorizationError('brokentoken', new Error());
      });
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      const SocketModeReceiver = importSocketModeReceiver(overrides);
      const receiver = new SocketModeReceiver({ appToken: 'xapp-example' });
      receiver.init(app);

      // Stub ack with an awaited promise for tests
      let notifyAckCalled: () => void;
      const ackCalled = new Promise<void>((resolve) => {
        notifyAckCalled = resolve;
      });
      const ack = mock.fn(async () => {
        notifyAckCalled();
      });

      receiver.client.emit('slack_event', { ack });
      await ackCalled;
      assert.strictEqual(ack.mock.callCount(), 1);
    });

    it('does not acknowledge events that throw unknown errors', async () => {
      const processStub = mock.fn(() => {
        throw new Error('internal error');
      });
      const defaultProcessEventErrorHandlerSpy = mock.fn(defaultProcessEventErrorHandler);
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      const SocketModeReceiver = importSocketModeReceiver(overrides);
      const receiver = new SocketModeReceiver({
        appToken: 'xapp-example',
        processEventErrorHandler: defaultProcessEventErrorHandlerSpy,
      });
      receiver.init(app);

      const slackRequestArgs = { body: {}, ack: mock.fn() };
      receiver.client.emit('slack_event', slackRequestArgs);

      while (defaultProcessEventErrorHandlerSpy.mock.callCount() === 0) {
        await delay(50);
      }
      assert.strictEqual(defaultProcessEventErrorHandlerSpy.mock.callCount(), 1);
      assert.strictEqual(slackRequestArgs.ack.mock.callCount(), 0);
    });

    it('does not re-acknowledge events that handle acknowledge and then throw unknown errors', async () => {
      const processStub = mock.fn(async (event: ReceiverEvent) => {
        await event.ack();
        throw new Error('internal error');
      });
      const defaultProcessEventErrorHandlerSpy = mock.fn(defaultProcessEventErrorHandler);
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      const SocketModeReceiver = importSocketModeReceiver(overrides);
      const receiver = new SocketModeReceiver({
        appToken: 'xapp-example',
        processEventErrorHandler: defaultProcessEventErrorHandlerSpy,
      });
      receiver.init(app);

      const slackRequestArgs = { body: {}, ack: mock.fn() };
      receiver.client.emit('slack_event', slackRequestArgs);

      while (defaultProcessEventErrorHandlerSpy.mock.callCount() === 0) {
        await delay(50);
      }
      assert.strictEqual(defaultProcessEventErrorHandlerSpy.mock.callCount(), 1);
      assert.strictEqual(slackRequestArgs.ack.mock.callCount(), 1);
    });
  });
});
