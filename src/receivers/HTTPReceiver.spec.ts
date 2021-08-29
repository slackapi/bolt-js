import 'mocha';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { Logger, LogLevel } from '@slack/logger';
import { EventEmitter } from 'events';
import { InstallProvider } from '@slack/oauth';
import { IncomingMessage, ServerResponse } from 'http';
import { Override, mergeOverrides } from '../test-helpers';
import { HTTPReceiverDeferredRequestError } from '../errors';

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
      });
      assert.isNotNull(receiver);
    });
  });
  describe('request handling', function () {
    it('should invoke installer generateInstallUrl if a request comes into the install path', async function () {
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
      fakeReq.headers = { host: 'localhost' };
      fakeReq.method = 'GET';
      const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      const end = sinon.fake();
      fakeRes.writeHead = writeHead;
      fakeRes.end = end;
      await receiver.requestListener(fakeReq, fakeRes);
      assert(installProviderStub.generateInstallUrl.calledWith(sinon.match({ metadata, scopes, userScopes })));
      assert.isTrue(writeHead.calledWith(200));
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
      fakeReq.headers = { host: 'localhost' };
      fakeReq.method = 'GET';
      const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      const end = sinon.fake();
      fakeRes.writeHead = writeHead;
      fakeRes.end = end;
      /* eslint-disable-next-line @typescript-eslint/await-thenable */
      await receiver.requestListener(fakeReq, fakeRes);
      assert(installProviderStub.generateInstallUrl.calledWith(sinon.match({ metadata, scopes, userScopes })));
      assert.isTrue(writeHead.calledWith(200));
      assert.isTrue(end.calledWith('Hello world!'));
    });
    it('should rediect installers if directInstall is true', async function () {
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
      fakeReq.headers = { host: 'localhost' };
      fakeReq.method = 'GET';
      const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      const end = sinon.fake();
      fakeRes.writeHead = writeHead;
      fakeRes.end = end;
      await receiver.requestListener(fakeReq, fakeRes);
      assert(installProviderStub.generateInstallUrl.calledWith(sinon.match({ metadata, scopes, userScopes })));
      assert.isTrue(writeHead.calledWith(302, sinon.match.object));
    });
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
      fakeReq.headers = { host: 'localhost' };
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
    it('should throw if a request comes into neither the install path nor the redirect URI path', async function () {
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
          redirectUriPath: '/heyo',
          metadata,
          userScopes,
        },
      });
      assert.isNotNull(receiver);
      receiver.installer = installProviderStub as unknown as InstallProvider;
      const fakeReq: IncomingMessage = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
      fakeReq.url = '/nope';
      fakeReq.headers = { host: 'localhost' };
      fakeReq.method = 'GET';
      const fakeRes: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      const end = sinon.fake();
      fakeRes.writeHead = writeHead;
      fakeRes.end = end;
      assert.throws(() => receiver.requestListener(fakeReq, fakeRes), HTTPReceiverDeferredRequestError);
    });
  });
});
