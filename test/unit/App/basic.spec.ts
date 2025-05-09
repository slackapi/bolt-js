import { LogLevel } from '@slack/logger';
import { assert } from 'chai';
import sinon from 'sinon';
import { ErrorCode } from '../../../src/errors';
import SocketModeReceiver from '../../../src/receivers/SocketModeReceiver';
import {
  FakeReceiver,
  createFakeConversationStore,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noop,
  noopMiddleware,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
  withSuccessfulBotUserFetchingWebClient,
} from '../helpers';

const fakeAppToken = 'xapp-1234';
const fakeBotId = 'B_FAKE_BOT_ID';
const fakeBotUserId = 'U_FAKE_BOT_USER_ID';

describe('App basic features', () => {
  const overrides = mergeOverrides(
    withNoopAppMetadata(),
    withSuccessfulBotUserFetchingWebClient(fakeBotId, fakeBotUserId),
  );

  describe('constructor', () => {
    describe('with a custom port value in HTTP Mode', () => {
      it('should accept a port value at the top-level', async () => {
        const MockApp = await importApp(overrides);
        const app = new MockApp({ token: '', signingSecret: '', port: 9999 });
        // biome-ignore lint/complexity/useLiteralKeys: reaching into private fields
        assert.propertyVal(app['receiver'], 'port', 9999);
      });
      it('should accept a port value under installerOptions', async () => {
        const MockApp = await importApp(overrides);
        const app = new MockApp({ token: '', signingSecret: '', port: 7777, installerOptions: { port: 9999 } });
        // biome-ignore lint/complexity/useLiteralKeys: reaching into private fields
        assert.propertyVal(app['receiver'], 'port', 9999);
      });
    });

    describe('with a custom port value in Socket Mode', () => {
      const installationStore = {
        storeInstallation: async () => {},
        fetchInstallation: async () => {
          throw new Error('Failed fetching installation');
        },
        deleteInstallation: async () => {},
      };
      it('should accept a port value at the top-level', async () => {
        const MockApp = await importApp(overrides);
        const app = new MockApp({
          socketMode: true,
          appToken: fakeAppToken,
          port: 9999,
          clientId: '',
          clientSecret: '',
          stateSecret: '',
          installerOptions: {},
          installationStore,
        });
        // biome-ignore lint/complexity/useLiteralKeys: reaching into private fields
        assert.propertyVal(app['receiver'], 'httpServerPort', 9999);
      });
      it('should accept a port value under installerOptions', async () => {
        const MockApp = await importApp(overrides);
        const app = new MockApp({
          socketMode: true,
          appToken: fakeAppToken,
          port: 7777,
          clientId: '',
          clientSecret: '',
          stateSecret: '',
          installerOptions: {
            port: 9999,
          },
          installationStore,
        });
        // biome-ignore lint/complexity/useLiteralKeys: reaching into private fields
        assert.propertyVal(app['receiver'], 'httpServerPort', 9999);
      });
    });

    // TODO: test when the single team authorization results fail. that should still succeed but warn. it also means
    // that the `ignoreSelf` middleware will fail (or maybe just warn) a bunch.
    describe('with successful single team authorization results', () => {
      it('should succeed with a token for single team authorization', async () => {
        const MockApp = await importApp(overrides);
        const app = new MockApp({ token: '', signingSecret: '' });
        // TODO: verify that the fake bot ID and fake bot user ID are retrieved
        assert.instanceOf(app, MockApp);
      });
      it('should pass the given token to app.client', async () => {
        const MockApp = await importApp(overrides);
        const app = new MockApp({ token: 'xoxb-foo-bar', signingSecret: '' });
        assert.isDefined(app.client);
        assert.equal(app.client.token, 'xoxb-foo-bar');
      });
    });
    it('should succeed with an authorize callback', async () => {
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();
      new MockApp({ authorize: authorizeCallback, signingSecret: '' });
      assert(authorizeCallback.notCalled, 'Should not call the authorize callback on instantiation');
    });
    it('should fail without a token for single team authorization, authorize callback, nor oauth installer', async () => {
      const MockApp = await importApp();
      try {
        new MockApp({ signingSecret: '' });
        assert.fail();
      } catch (error) {
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both a token and authorize callback are specified', async () => {
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();
      try {
        new MockApp({ token: '', authorize: authorizeCallback, signingSecret: '' });
        assert.fail();
      } catch (error) {
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    it('should fail when both a token is specified and OAuthInstaller is initialized', async () => {
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();
      try {
        new MockApp({ token: '', clientId: '', clientSecret: '', stateSecret: '', signingSecret: '' });
        assert.fail();
      } catch (error) {
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    it('should fail when both a authorize callback is specified and OAuthInstaller is initialized', async () => {
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();
      try {
        new MockApp({
          authorize: authorizeCallback,
          clientId: '',
          clientSecret: '',
          stateSecret: '',
          signingSecret: '',
        });
        assert.fail();
      } catch (error) {
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    describe('with a custom receiver', () => {
      it('should succeed with no signing secret', async () => {
        const MockApp = await importApp();
        new MockApp({
          receiver: new FakeReceiver(),
          authorize: noop,
        });
      });
    });
    it('should fail when no signing secret for the default receiver is specified', async () => {
      const MockApp = await importApp();
      try {
        new MockApp({ authorize: noop });
        assert.fail();
      } catch (error) {
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both socketMode and a custom receiver are specified', async () => {
      const fakeReceiver = new FakeReceiver();
      const MockApp = await importApp();
      try {
        new MockApp({ token: '', signingSecret: '', socketMode: true, receiver: fakeReceiver });
        assert.fail();
      } catch (error) {
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should succeed when both socketMode and SocketModeReceiver are specified', async () => {
      const MockApp = await importApp(overrides);
      const socketModeReceiver = new SocketModeReceiver({ appToken: fakeAppToken });
      new MockApp({ token: '', signingSecret: '', socketMode: true, receiver: socketModeReceiver });
    });
    it('should initialize MemoryStore conversation store by default', async () => {
      const fakeMemoryStore = sinon.fake();
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withMemoryStore(fakeMemoryStore),
        withConversationContext(fakeConversationContext),
      );
      const MockApp = await importApp(overrides);

      new MockApp({ authorize: noop, signingSecret: '' });
      assert(fakeMemoryStore.calledWithNew);
      assert(fakeConversationContext.called);
    });
    describe('conversation store', () => {
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withConversationContext(fakeConversationContext),
      );
      it('should initialize without a conversation store when option is false', async () => {
        const MockApp = await importApp(overrides);
        new MockApp({ convoStore: false, authorize: noop, signingSecret: '' });
        assert(fakeConversationContext.notCalled);
      });
      it('should initialize the conversation store', async () => {
        const dummyConvoStore = createFakeConversationStore();
        const MockApp = await importApp(overrides);
        const app = new MockApp({ convoStore: dummyConvoStore, authorize: noop, signingSecret: '' });
        assert.instanceOf(app, MockApp);
        assert(fakeConversationContext.firstCall.calledWith(dummyConvoStore));
      });
    });
    describe('with custom redirectUri supplied', () => {
      it('should fail when missing installerOptions', async () => {
        const MockApp = await importApp();
        try {
          new MockApp({ token: '', signingSecret: '', redirectUri: 'http://example.com/redirect' }); // eslint-disable-line no-new
          assert.fail();
        } catch (error) {
          assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        }
      });
      it('should fail when missing installerOptions.redirectUriPath', async () => {
        const MockApp = await importApp();
        try {
          new MockApp({
            token: '',
            signingSecret: '',
            redirectUri: 'http://example.com/redirect',
            installerOptions: {},
          });
          assert.fail();
        } catch (error) {
          assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        }
      });
    });
    it('with WebClientOptions', async () => {
      const fakeConstructor = sinon.fake();
      const overrides = mergeOverrides(withNoopAppMetadata(), {
        '@slack/web-api': {
          WebClient: class {
            // biome-ignore lint/suspicious/noExplicitAny: test overrides can be anything
            public constructor(...args: any[]) {
              fakeConstructor(...args);
            }
          },
        },
      });

      const MockApp = await importApp(overrides);
      const clientOptions = { slackApiUrl: 'proxy.slack.com' };
      new MockApp({ clientOptions, authorize: noop, signingSecret: '', logLevel: LogLevel.ERROR });
      assert.ok(fakeConstructor.called);
      const [token, options] = fakeConstructor.lastCall.args;
      assert.strictEqual(token, undefined, 'token should be undefined');
      assert.strictEqual(clientOptions.slackApiUrl, options.slackApiUrl);
      assert.strictEqual(LogLevel.ERROR, options.logLevel, 'override logLevel');
    });
    describe('with auth.test failure', () => {
      const fakeConstructor = sinon.fake();
      const exception = 'This API method call should not be performed';
      const overrides = mergeOverrides(withNoopAppMetadata(), {
        '@slack/web-api': {
          WebClient: class {
            // biome-ignore lint/suspicious/noExplicitAny: test overrides can be anything
            public constructor(...args: any[]) {
              fakeConstructor(args);
            }

            public auth = {
              test: () => {
                throw new Error(exception);
              },
            };
          },
        },
      });
      it('should not perform auth.test API call if tokenVerificationEnabled is false', async () => {
        const MockApp = await importApp(overrides);
        new MockApp({
          token: 'xoxb-completely-invalid-token',
          signingSecret: 'invalid-one',
          tokenVerificationEnabled: false,
        });
      });

      it('should fail in await App#init()', async () => {
        const MockApp = await importApp(overrides);
        const app = new MockApp({
          token: 'xoxb-completely-invalid-token',
          signingSecret: 'invalid-one',
          deferInitialization: true,
        });
        assert.instanceOf(app, MockApp);
        try {
          await app.start();
          assert.fail('The start() method should fail before init() call');
        } catch (err) {
          assert.propertyVal(
            err,
            'message',
            'This App instance is not yet initialized. Call `await App#init()` before starting the app.',
          );
        }
        try {
          await app.init();
          assert.fail('The init() method should fail here');
        } catch (err) {
          console.log(err);
          assert.propertyVal(err, 'message', exception);
        }
      });
    });

    describe('with developerMode', () => {
      it('should accept developerMode: true', async () => {
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withSuccessfulBotUserFetchingWebClient('B_FAKE_BOT_ID', 'U_FAKE_BOT_USER_ID'),
        );
        const fakeLogger = createFakeLogger();
        const MockApp = await importApp(overrides);
        const app = new MockApp({ logger: fakeLogger, token: '', appToken: fakeAppToken, developerMode: true });
        assert.propertyVal(app, 'logLevel', LogLevel.DEBUG);
        assert.propertyVal(app, 'socketMode', true);
      });
    });

    // TODO: tests for logger and logLevel option
    // TODO: tests for providing botId and botUserId options
    // TODO: tests for providing endpoints option
  });

  describe('#start', () => {
    it('should pass calls through to receiver', async () => {
      // Arrange
      const dummyReturn = Symbol();
      const fakeReceiver = new FakeReceiver();
      const MockApp = await importApp();
      const app = new MockApp({ receiver: fakeReceiver, authorize: noop });
      fakeReceiver.start = sinon.fake.returns(sinon.promise().resolve(dummyReturn));
      await app.start(1337);
      assert.deepEqual(fakeReceiver.start.firstCall.args, [1337]);
    });
  });

  describe('#stop', () => {
    it('should pass calls through to receiver', async () => {
      const dummyReturn = Symbol();
      const dummyParams = [Symbol(), Symbol()];
      const fakeReceiver = new FakeReceiver();
      const MockApp = await importApp();
      fakeReceiver.stop = sinon.fake.returns(sinon.promise().resolve(dummyReturn));

      const app = new MockApp({ receiver: fakeReceiver, authorize: noop });
      const actualReturn = await app.stop(...dummyParams);

      assert.deepEqual(actualReturn, dummyReturn);
      assert.deepEqual(fakeReceiver.stop.firstCall.args, dummyParams as unknown);
    });
  });
});
