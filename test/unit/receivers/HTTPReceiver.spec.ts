import assert from 'node:assert/strict';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import { beforeEach, describe, it, mock } from 'node:test';
import { InstallProvider } from '@slack/oauth';
import type { ParamsDictionary } from 'express-serve-static-core';
import { match } from 'path-to-regexp';
import {
  AppInitializationError,
  CustomRouteInitializationError,
  HTTPReceiverDeferredRequestError,
} from '../../../src/errors';
import type { CustomRoute } from '../../../src/receivers/custom-routes';
import {
  createFakeLogger,
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
function importHTTPReceiver(overrides: Override = {}): typeof import('../../../src/receivers/HTTPReceiver').default {
  const absolutePath = path.resolve(__dirname, '../../../src/receivers/HTTPReceiver');
  return proxyquire(absolutePath, overrides).default;
}

describe('HTTPReceiver', () => {
  // TODO: we pick up the socket listener method so we can assert on its behaviour; probably should add tests for it then
  // let httpRequestListener: typeof noopVoid;
  let fakeServer: FakeServer;
  let fakeCreateServer: MockFn;
  const noopLogger = createFakeLogger();
  let overrides: Override;
  beforeEach(() => {
    fakeServer = new FakeServer();
    fakeCreateServer = mock.fn((_options: Record<string, unknown>, _handler: typeof noopVoid) => {
      // TODO: we pick up the socket listener method so we can assert on its behaviour; probably should add tests for it then
      // httpRequestListener = _handler;
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
      const HTTPReceiver = importHTTPReceiver(overrides);

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
      assert.notStrictEqual(receiver, null);
    });

    it('should accept a custom port', async () => {
      const HTTPReceiver = importHTTPReceiver(overrides);

      const defaultPort = new HTTPReceiver({
        signingSecret: 'secret',
      });
      assert.notStrictEqual(defaultPort, null);
      assert.strictEqual(Reflect.get(defaultPort, 'port'), 3000);

      const customPort = new HTTPReceiver({
        port: 9999,
        signingSecret: 'secret',
      });
      assert.notStrictEqual(customPort, null);
      assert.strictEqual(Reflect.get(customPort, 'port'), 9999);

      const customPort2 = new HTTPReceiver({
        port: 7777,
        signingSecret: 'secret',
        installerOptions: {
          port: 9999,
        },
      });
      assert.notStrictEqual(customPort2, null);
      assert.strictEqual(Reflect.get(customPort2, 'port'), 9999);
    });

    it('should throw an error if signingSecret is empty string and signature verification enabled', async () => {
      const HTTPReceiver = importHTTPReceiver(overrides);
      try {
        new HTTPReceiver({ signingSecret: '' });
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof AppInitializationError);
      }
    });

    it('should succeed with empty signingSecret when signatureVerification is false', async () => {
      const HTTPReceiver = importHTTPReceiver(overrides);
      const receiver = new HTTPReceiver({ signingSecret: '', signatureVerification: false });
      assert.notStrictEqual(receiver, null);
    });

    it('should throw an error if redirect uri options supplied invalid or incomplete', async () => {
      const HTTPReceiver = importHTTPReceiver();
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
      assert.notStrictEqual(receiver, null);
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
      const HTTPReceiver = importHTTPReceiver(overrides);

      const defaultPort = new HTTPReceiver({
        signingSecret: 'secret',
      });
      assert.notStrictEqual(defaultPort, null);
      assert.strictEqual(Reflect.get(defaultPort, 'port'), 3000);
      await defaultPort.start(9001);
      assert.strictEqual(fakeServer.listen.mock.calls[0].arguments[0], 9001);
      await defaultPort.stop();
      fakeServer.listen.mock.resetCalls();
      await defaultPort.start('1337');
      assert.strictEqual(fakeServer.listen.mock.calls[0].arguments[0], 1337);
      await defaultPort.stop();
    });
  });
  describe('request handling', () => {
    describe('handleInstallPathRequest()', () => {
      it('should invoke installer handleInstallPath if a request comes into the install path', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const HTTPReceiver = importHTTPReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/hiya';
        fakeReq.method = 'GET';
        const fakeRes = mockInstance(ServerResponse);
        receiver.requestListener(fakeReq, fakeRes as unknown as ServerResponse);
        assert.deepStrictEqual(installProviderStub.handleInstallPath.mock.calls[0].arguments.slice(0, 2), [
          fakeReq,
          fakeRes,
        ]);
      });

      it('should use a custom HTML renderer for the install path webpage', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const HTTPReceiver = importHTTPReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq: IncomingMessage = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/hiya';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        receiver.requestListener(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleInstallPath.mock.calls[0].arguments.slice(0, 2), [
          fakeReq,
          fakeRes,
        ]);
      });

      it('should redirect installers if directInstall is true', async () => {
        const installProviderStub = mockInstance(InstallProvider);
        const HTTPReceiver = importHTTPReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq: IncomingMessage = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/hiya';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        receiver.requestListener(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleInstallPath.mock.calls[0].arguments.slice(0, 2), [
          fakeReq,
          fakeRes,
        ]);
      });
    });

    describe('handleInstallRedirectRequest()', () => {
      it('should invoke installer handler if a request comes into the redirect URI path', async () => {
        const installProviderStub = Object.assign(mockInstance(InstallProvider), {
          handleCallback: mock.fn(() => Promise.resolve()) as unknown as Promise<void>,
        });
        const HTTPReceiver = importHTTPReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/heyo';
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        receiver.requestListener(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleCallback.mock.calls[0].arguments, [
          fakeReq,
          fakeRes,
          callbackOptions,
        ]);
      });

      it('should invoke installer handler with installURLoptions supplied if state verification is off', async () => {
        const installProviderStub = Object.assign(mockInstance(InstallProvider), {
          handleCallback: mock.fn(() => Promise.resolve()) as unknown as Promise<void>,
        });
        const HTTPReceiver = importHTTPReceiver(overrides);

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
        assert.notStrictEqual(receiver, null);
        receiver.installer = installProviderStub as unknown as InstallProvider;
        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/heyo';
        fakeReq.method = 'GET';
        const fakeRes = mockInstance(ServerResponse) as unknown as ServerResponse;
        receiver.requestListener(fakeReq, fakeRes);
        assert.deepStrictEqual(installProviderStub.handleCallback.mock.calls[0].arguments, [
          fakeReq,
          fakeRes,
          callbackOptions,
          installUrlOptions,
        ]);
      });
    });
    describe('custom route handling', async () => {
      it('should call custom route handler only if request matches route path and method', async () => {
        const HTTPReceiver = importHTTPReceiver();
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: mock.fn() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq: IncomingMessage = mockInstance(IncomingMessage) as IncomingMessage;
        const fakeRes: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches route path and method, ignoring query params', async () => {
        const HTTPReceiver = importHTTPReceiver();
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: mock.fn() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = mockInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test?hello=world';
        const tempMatch = matchRegex('/test');
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches route path and method including params', async () => {
        const HTTPReceiver = importHTTPReceiver();
        const customRoutes = [{ path: '/test/:id', method: ['get', 'POST'], handler: mock.fn() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = mockInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params', async () => {
        const HTTPReceiver = importHTTPReceiver();
        const customRoutes = [
          { path: '/test/123', method: ['get', 'POST'], handler: mock.fn() },
          { path: '/test/:id', method: ['get', 'POST'], handler: mock.fn() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = mockInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);
        assert.strictEqual(customRoutes[1].handler.mock.callCount(), 0);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params reverse order', async () => {
        const HTTPReceiver = importHTTPReceiver();
        const customRoutes = [
          { path: '/test/:id', method: ['get', 'POST'], handler: mock.fn() },
          { path: '/test/123', method: ['get', 'POST'], handler: mock.fn() },
        ];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });
        const receiver = new HTTPReceiver({
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
          customRoutes,
        });

        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = mockInstance(ServerResponse) as unknown as ServerResponse;

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params: ParamsDictionary = tempMatch.params as ParamsDictionary;

        fakeReq.method = 'GET';
        receiver.requestListener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);
        assert.strictEqual(customRoutes[1].handler.mock.callCount(), 0);

        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert.deepStrictEqual(customRoutes[0].handler.mock.calls[0].arguments, [expectedMessage, fakeRes]);

        fakeReq.method = 'UNHANDLED_METHOD';
        assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
      });

      it("should throw an error if customRoutes don't have the required keys", async () => {
        const HTTPReceiver = importHTTPReceiver();
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
      const installProviderStub = mockInstance(InstallProvider);
      const HTTPReceiver = importHTTPReceiver(overrides);

      const metadata = 'this is bat country';
      const scopes = ['channels:read'];
      const userScopes = ['chat:write'];
      const customRoutes = [{ path: '/nope', method: 'POST', handler: mock.fn() }];

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

      assert.notStrictEqual(receiver, null);
      receiver.installer = installProviderStub as unknown as InstallProvider;

      const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
      fakeReq.url = '/nope';
      fakeReq.method = 'GET';

      const fakeRes = mockInstance(ServerResponse) as unknown as ServerResponse;

      assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
    });

    describe('ssl_check handling', () => {
      let fakeHttpFunctions: Record<string, MockFn>;
      let receiver: InstanceType<ReturnType<typeof importHTTPReceiver>>;
      let fakeRes: ServerResponse;

      beforeEach(() => {
        fakeHttpFunctions = {
          parseAndVerifyHTTPRequest: mock.fn(() =>
            Promise.resolve({
              rawBody: Buffer.from(''),
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
            }),
          ),
          parseHTTPRequestBody: mock.fn(),
          buildSSLCheckResponse: mock.fn(),
          buildNoBodyResponse: mock.fn(),
          extractRetryNumFromHTTPRequest: mock.fn(() => undefined),
          extractRetryReasonFromHTTPRequest: mock.fn(() => undefined),
        };
        const HTTPReceiver = importHTTPReceiver(
          mergeOverrides(overrides, { './HTTPModuleFunctions': fakeHttpFunctions }),
        );
        receiver = new HTTPReceiver({
          logger: noopLogger,
          clientId: 'my-clientId',
          clientSecret: 'my-client-secret',
          signingSecret: 'secret',
        });
        fakeRes = mockInstance(ServerResponse) as unknown as ServerResponse;
      });

      it('should respond to ssl_check=1 with 200', async () => {
        fakeHttpFunctions.parseHTTPRequestBody = mock.fn(() => ({ ssl_check: '1' }));
        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/slack/events';
        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        await new Promise((resolve) => setImmediate(resolve));
        assert.strictEqual(fakeHttpFunctions.buildSSLCheckResponse.mock.callCount(), 1);
      });

      it('should not treat ssl_check=0 as an ssl_check request', async () => {
        fakeHttpFunctions.parseHTTPRequestBody = mock.fn(() => ({ ssl_check: '0' }));
        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/slack/events';
        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        await new Promise((resolve) => setImmediate(resolve));
        assert.strictEqual(fakeHttpFunctions.buildSSLCheckResponse.mock.callCount(), 0);
      });

      it('should not treat an empty ssl_check value as an ssl_check request', async () => {
        fakeHttpFunctions.parseHTTPRequestBody = mock.fn(() => ({ ssl_check: '' }));
        const fakeReq = mockInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/slack/events';
        fakeReq.method = 'POST';
        receiver.requestListener(fakeReq, fakeRes);
        await new Promise((resolve) => setImmediate(resolve));
        assert.strictEqual(fakeHttpFunctions.buildSSLCheckResponse.mock.callCount(), 0);
      });
    });

    describe('request body size limiting', () => {
      // Drive a real POST through requestListener with a readable body and let the real raw-body
      // enforce the limit. handleIncomingEvent is fire-and-forget, so we resolve when the response
      // is ended rather than guessing how many ticks the stream read takes.
      async function postBody(
        receiver: InstanceType<ReturnType<typeof importHTTPReceiver>>,
        bodyLength: number,
      ): Promise<MockFn> {
        const req = new Readable();
        req.push('x'.repeat(bodyLength));
        req.push(null); // indicate EOF
        // biome-ignore lint/suspicious/noExplicitAny: mock requests can be anything
        const untypedReq = req as Record<string, any>;
        untypedReq.headers = { 'content-type': 'application/json' };
        untypedReq.url = '/slack/events';
        untypedReq.method = 'POST';

        let resolveEnded: () => void = () => {};
        const ended = new Promise<void>((resolve) => {
          resolveEnded = resolve;
        });
        const writeHead = mock.fn();
        const res = { writeHead, end: mock.fn(() => resolveEnded()) };

        receiver.requestListener(req as unknown as IncomingMessage, res as unknown as ServerResponse);
        await ended;
        return writeHead;
      }

      it('should respond with 413 when the request body exceeds bodyLimit', async () => {
        const HTTPReceiver = importHTTPReceiver(overrides);
        const receiver = new HTTPReceiver({ logger: noopLogger, signingSecret: 'secret', bodyLimit: 128 });
        const writeHead = await postBody(receiver, 1024);
        assert.deepStrictEqual(writeHead.mock.calls[0].arguments, [413]);
      });

      it('should respond with 413 for oversized bodies even when signatureVerification is false', async () => {
        const HTTPReceiver = importHTTPReceiver(overrides);
        const receiver = new HTTPReceiver({
          logger: noopLogger,
          signingSecret: 'secret',
          signatureVerification: false,
          bodyLimit: 128,
        });
        const writeHead = await postBody(receiver, 1024);
        assert.deepStrictEqual(writeHead.mock.calls[0].arguments, [413]);
      });

      it('should respond with 413 when a string bodyLimit is exceeded', async () => {
        const HTTPReceiver = importHTTPReceiver(overrides);
        const receiver = new HTTPReceiver({ logger: noopLogger, signingSecret: 'secret', bodyLimit: '128b' });
        const writeHead = await postBody(receiver, 1024);
        assert.deepStrictEqual(writeHead.mock.calls[0].arguments, [413]);
      });

      it('should not respond with 413 for large bodies when bodyLimit is Infinity', async () => {
        // Buffering passes (no limit); the request then fails signature verification with 401, never 413.
        const HTTPReceiver = importHTTPReceiver(overrides);
        const receiver = new HTTPReceiver({ logger: noopLogger, signingSecret: 'secret', bodyLimit: Infinity });
        const writeHead = await postBody(receiver, 5000);
        assert.ok(!writeHead.mock.calls.some((call) => call.arguments[0] === 413));
      });
    });
  });
});
