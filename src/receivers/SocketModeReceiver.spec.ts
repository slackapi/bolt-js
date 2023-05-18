import 'mocha';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { Logger, LogLevel } from '@slack/logger';
import { EventEmitter } from 'events';
import { IncomingMessage, ServerResponse } from 'http';
import { match } from 'path-to-regexp';
import { ParamsDictionary } from 'express-serve-static-core';
import { InstallProvider } from '@slack/oauth';
import { SocketModeClient } from '@slack/socket-mode';
import { Override, mergeOverrides } from '../test-helpers';
import { CustomRouteInitializationError, AppInitializationError } from '../errors';

// Fakes
class FakeServer extends EventEmitter {
  public on = sinon.fake();

  public listen = sinon.fake(() => {
    if (this.listeningFailure !== undefined) {
      this.emit('error', this.listeningFailure);
    }
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

describe('SocketModeReceiver', function () {
  beforeEach(function () {
    this.listener = (_req: any, _res: any) => {};
    this.fakeServer = new FakeServer();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.fakeCreateServer = sinon.fake(function (handler: (req: any, res: any) => void) {
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
      // since v3.8, the constructor does not start the server
      // assert.isNotOk(this.fakeServer.listen.calledWith(3000));
    });
    it('should allow for customizing port the socket listens on', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
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
      // since v3.8, the constructor does not start the server
      // assert.isOk(this.fakeServer.listen.calledWith(customPort));
    });
    it('should allow for extracting additional values from Socket Mode messages', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const SocketModeReceiver = await importSocketModeReceiver(overrides);

      const receiver = new SocketModeReceiver({
        appToken: 'my-secret',
        logger: noopLogger,
        customPropertiesExtractor: ({ type, body }) => ({ payload_type: type, body }),
      });
      assert.isNotNull(receiver);
    });
    it('should throw an error if redirect uri options supplied invalid or incomplete', async function () {
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
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
      assert.throws(() => new SocketModeReceiver({
        appToken,
        clientId,
        clientSecret,
        stateSecret,
        scopes,
        redirectUri,
      }), AppInitializationError);
      // inconsistent redirectUriPath
      assert.throws(() => new SocketModeReceiver({
        appToken,
        clientId: 'my-clientId',
        clientSecret,
        stateSecret,
        scopes,
        redirectUri,
        installerOptions: {
          redirectUriPath: '/hiya',
        },
      }), AppInitializationError);
      // inconsistent redirectUri
      assert.throws(() => new SocketModeReceiver({
        appToken,
        clientId: 'my-clientId',
        clientSecret,
        stateSecret,
        scopes,
        redirectUri: 'http://example.com/hiya',
        installerOptions,
      }), AppInitializationError);
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
        await this.listener(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });
      it('should use a custom HTML renderer for the install path webpage', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
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
        await this.listener(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });
      it('should redirect installers if directInstall is true', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
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
        await this.listener(fakeReq, fakeRes);
        assert(installProviderStub.handleInstallPath.calledWith(fakeReq, fakeRes));
      });
    });
    describe('handleInstallRedirectRequest()', function () {
      it('should invoke installer handleCallback if a request comes into the redirect URI path', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
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
        await this.listener(fakeReq, fakeRes);
        assert(
          installProviderStub.handleCallback.calledWith(
            fakeReq as IncomingMessage,
            fakeRes as unknown as ServerResponse,
            callbackOptions,
          ),
        );
      });
      it('should invoke handleCallback with installURLoptions as params if state verification is off', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
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
        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        fakeReq.url = '/heyo';
        fakeReq.headers = { host: 'localhost' };
        fakeReq.method = 'GET';
        const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        fakeRes.writeHead = sinon.fake();
        fakeRes.end = sinon.fake();
        await this.listener(fakeReq, fakeRes);
        sinon.assert.calledWith(
          installProviderStub.handleCallback,
          fakeReq as IncomingMessage,
          fakeRes as unknown as ServerResponse,
          callbackOptions,
          installUrlOptions,
        );
      });
    });
    describe('custom route handling', function () {
      it('should call custom route handler only if request matches route path and method', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = { writeHead: sinon.fake(), end: sinon.fake() };

        fakeReq.url = '/test';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await this.listener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'POST';
        await this.listener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await this.listener(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler when request matches path, ignoring query params', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = { writeHead: sinon.fake(), end: sinon.fake() };

        fakeReq.url = '/test?hello=world';
        const tempMatch = matchRegex('/test');
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await this.listener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'POST';
        await this.listener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await this.listener(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler only if request matches route path and method including params', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [{ path: '/test/:id', method: ['get', 'POST'], handler: sinon.fake() }];
        const matchRegex = match(customRoutes[0].path, { decode: decodeURIComponent });

        const receiver = new SocketModeReceiver({
          appToken: 'my-secret',
          customRoutes,
        });
        assert.isNotNull(receiver);
        receiver.installer = installProviderStub as unknown as InstallProvider;

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = { writeHead: sinon.fake(), end: sinon.fake() };

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await this.listener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'POST';
        await this.listener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, { params });
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await this.listener(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
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

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = { writeHead: sinon.fake(), end: sinon.fake() };

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await this.listener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'POST';
        await this.listener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'UNHANDLED_METHOD';
        await this.listener(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it('should call custom route handler only if request matches multiple route paths and method including params reverse order', async function () {
        // Arrange
        const installProviderStub = sinon.createStubInstance(InstallProvider);
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
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

        const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const fakeRes = { writeHead: sinon.fake(), end: sinon.fake() };

        fakeReq.url = '/test/123';
        const tempMatch = matchRegex(fakeReq.url);
        if (!tempMatch) throw new Error('match failed');
        const params : ParamsDictionary = tempMatch.params as ParamsDictionary;
        fakeReq.headers = { host: 'localhost' };

        fakeReq.method = 'GET';
        await this.listener(fakeReq, fakeRes);
        let expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));
        assert(customRoutes[1].handler.notCalled);

        fakeReq.method = 'POST';
        await this.listener(fakeReq, fakeRes);
        expectedMessage = Object.assign(fakeReq, params);
        assert(customRoutes[0].handler.calledWith(expectedMessage, fakeRes));

        fakeReq.method = 'UNHANDLED_METHOD';
        await this.listener(fakeReq, fakeRes);
        assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
        assert(fakeRes.end.called);
      });

      it("should throw an error if customRoutes don't have the required keys", async function () {
        // Arrange
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const SocketModeReceiver = await importSocketModeReceiver(overrides);
        const customRoutes = [{ handler: sinon.fake() }] as any;

        assert.throws(() => new SocketModeReceiver({ appToken: 'my-secret', customRoutes }), CustomRouteInitializationError);
      });
    });

    it('should return a 404 if a request passes the install path, redirect URI path and custom routes', async function () {
      // Arrange
      const installProviderStub = sinon.createStubInstance(InstallProvider);
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
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
      const fakeReq = {
        url: '/nope',
        method: 'GET',
      };
      const fakeRes = {
        writeHead: sinon.fake(),
        end: sinon.fake(),
      };
      await this.listener(fakeReq, fakeRes);
      assert(fakeRes.writeHead.calledWith(404, sinon.match.object));
      assert(fakeRes.end.calledOnce);
    });
  });

  describe('#start()', function () {
    it('should invoke the SocketModeClient start method', async function () {
      // Arrange
      const clientStub = sinon.createStubInstance(SocketModeClient);
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
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
  describe('#stop()', function () {
    it('should invoke the SocketModeClient disconnect method', async function () {
      // Arrange
      const clientStub = sinon.createStubInstance(SocketModeClient);
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
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
});

/* Testing Harness */

// Loading the system under test using overrides
async function importSocketModeReceiver(
  overrides: Override = {},
): Promise<typeof import('./SocketModeReceiver').default> {
  return (await rewiremock.module(() => import('./SocketModeReceiver'), overrides)).default;
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
