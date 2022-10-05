import 'mocha';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { LogLevel } from '@slack/logger';
import { WebClientOptions, WebClient } from '@slack/web-api';
import { Override, mergeOverrides, createFakeLogger } from './test-helpers';
import { ErrorCode } from './errors';
import {
  Receiver,
  ReceiverEvent,
  SayFn,
  NextFn,
} from './types';
import { ConversationStore } from './conversation-store';
import App from './App';

// Utility functions
const noop = () => Promise.resolve(undefined);
const noopMiddleware = async ({ next }: { next: NextFn }) => {
  await next();
};
const noopAuthorize = () => Promise.resolve({});

// Fakes
class FakeReceiver implements Receiver {
  private bolt: App | undefined;

  public init = (bolt: App) => {
    this.bolt = bolt;
  };

  public start = sinon.fake((...params: any[]): Promise<unknown> => Promise.resolve([...params]));

  public stop = sinon.fake((...params: any[]): Promise<unknown> => Promise.resolve([...params]));

  public async sendEvent(event: ReceiverEvent): Promise<void> {
    return this.bolt?.processEvent(event);
  }
}

// Dummies (values that have no real behavior but pass through the system opaquely)
function createDummyReceiverEvent(type: string = 'dummy_event_type'): ReceiverEvent {
  // NOTE: this is a degenerate ReceiverEvent that would successfully pass through the App. it happens to look like a
  // IncomingEventType.Event
  return {
    body: {
      event: {
        type,
      },
    },
    ack: noop,
  };
}

describe('App basic features', () => {
  describe('constructor', () => {
    describe('with a custom port value in HTTP Mode', () => {
      const fakeBotId = 'B_FAKE_BOT_ID';
      const fakeBotUserId = 'U_FAKE_BOT_USER_ID';
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withSuccessfulBotUserFetchingWebClient(fakeBotId, fakeBotUserId),
      );
      it('should accept a port value at the top-level', async () => {
        // Arrange
        const MockApp = await importApp(overrides);
        // Act
        const app = new MockApp({ token: '', signingSecret: '', port: 9999 });
        // Assert
        assert.equal((app as any).receiver.port, 9999);
      });
      it('should accept a port value under installerOptions', async () => {
        // Arrange
        const MockApp = await importApp(overrides);
        // Act
        const app = new MockApp({ token: '', signingSecret: '', port: 7777, installerOptions: { port: 9999 } });
        // Assert
        assert.equal((app as any).receiver.port, 9999);
      });
    });

    describe('with a custom port value in Socket Mode', () => {
      const fakeBotId = 'B_FAKE_BOT_ID';
      const fakeBotUserId = 'U_FAKE_BOT_USER_ID';
      const installationStore = {
        storeInstallation: async () => { },
        fetchInstallation: async () => { throw new Error('Failed fetching installation'); },
        deleteInstallation: async () => { },
      };
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withSuccessfulBotUserFetchingWebClient(fakeBotId, fakeBotUserId),
      );
      it('should accept a port value at the top-level', async () => {
        // Arrange
        const MockApp = await importApp(overrides);
        // Act
        const app = new MockApp({
          socketMode: true,
          appToken: '',
          port: 9999,
          clientId: '',
          clientSecret: '',
          stateSecret: '',
          installerOptions: {
          },
          installationStore,
        });
        // Assert
        assert.equal((app as any).receiver.httpServerPort, 9999);
      });
      it('should accept a port value under installerOptions', async () => {
        // Arrange
        const MockApp = await importApp(overrides);
        // Act
        const app = new MockApp({
          socketMode: true,
          appToken: '',
          port: 7777,
          clientId: '',
          clientSecret: '',
          stateSecret: '',
          installerOptions: {
            port: 9999,
          },
          installationStore,
        });
        // Assert
        assert.equal((app as any).receiver.httpServerPort, 9999);
      });
    });

    // TODO: test when the single team authorization results fail. that should still succeed but warn. it also means
    // that the `ignoreSelf` middleware will fail (or maybe just warn) a bunch.
    describe('with successful single team authorization results', () => {
      it('should succeed with a token for single team authorization', async () => {
        // Arrange
        const fakeBotId = 'B_FAKE_BOT_ID';
        const fakeBotUserId = 'U_FAKE_BOT_USER_ID';
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withSuccessfulBotUserFetchingWebClient(fakeBotId, fakeBotUserId),
        );
        const MockApp = await importApp(overrides);

        // Act
        const app = new MockApp({ token: '', signingSecret: '' });

        // Assert
        // TODO: verify that the fake bot ID and fake bot user ID are retrieved
        assert.instanceOf(app, MockApp);
      });
      it('should pass the given token to app.client', async () => {
        // Arrange
        const fakeBotId = 'B_FAKE_BOT_ID';
        const fakeBotUserId = 'U_FAKE_BOT_USER_ID';
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withSuccessfulBotUserFetchingWebClient(fakeBotId, fakeBotUserId),
        );
        const MockApp = await importApp(overrides);

        // Act
        const app = new MockApp({ token: 'xoxb-foo-bar', signingSecret: '' });

        // Assert
        assert.isDefined(app.client);
        assert.equal(app.client.token, 'xoxb-foo-bar');
      });
    });
    it('should succeed with an authorize callback', async () => {
      // Arrange
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();

      // Act
      const app = new MockApp({ authorize: authorizeCallback, signingSecret: '' });

      // Assert
      assert(authorizeCallback.notCalled, 'Should not call the authorize callback on instantiation');
      assert.instanceOf(app, MockApp);
    });
    it('should fail without a token for single team authorization, authorize callback, nor oauth installer', async () => {
      // Arrange
      const MockApp = await importApp();

      // Act
      try {
        new MockApp({ signingSecret: '' }); // eslint-disable-line no-new
        assert.fail();
      } catch (error: any) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both a token and authorize callback are specified', async () => {
      // Arrange
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();

      // Act
      try {
        new MockApp({ token: '', authorize: authorizeCallback, signingSecret: '' }); // eslint-disable-line no-new
        assert.fail();
      } catch (error: any) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    it('should fail when both a token is specified and OAuthInstaller is initialized', async () => {
      // Arrange
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();

      // Act
      try {
        new MockApp({ token: '', clientId: '', clientSecret: '', stateSecret: '', signingSecret: '' }); // eslint-disable-line no-new
        assert.fail();
      } catch (error: any) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    it('should fail when both a authorize callback is specified and OAuthInstaller is initialized', async () => {
      // Arrange
      const authorizeCallback = sinon.fake();
      const MockApp = await importApp();

      // Act
      try {
        new MockApp({ authorize: authorizeCallback, clientId: '', clientSecret: '', stateSecret: '', signingSecret: '' }); // eslint-disable-line no-new
        assert.fail();
      } catch (error: any) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    describe('with a custom receiver', () => {
      it('should succeed with no signing secret', async () => {
        // Arrange
        const MockApp = await importApp();

        // Act
        const app = new MockApp({ receiver: new FakeReceiver(), authorize: noopAuthorize });

        // Assert
        assert.instanceOf(app, MockApp);
      });
    });
    it('should fail when no signing secret for the default receiver is specified', async () => {
      // Arrange
      const MockApp = await importApp();

      // Act
      try {
        new MockApp({ authorize: noopAuthorize }); // eslint-disable-line no-new
        assert.fail();
      } catch (error: any) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both socketMode and receiver are specified', async () => {
      // Arrange
      const fakeReceiver = new FakeReceiver();
      const MockApp = await importApp();

      // Act
      try {
        new MockApp({ token: '', signingSecret: '', socketMode: true, receiver: fakeReceiver }); // eslint-disable-line no-new
        assert.fail();
      } catch (error: any) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should initialize MemoryStore conversation store by default', async () => {
      // Arrange
      const fakeMemoryStore = sinon.fake();
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withMemoryStore(fakeMemoryStore),
        withConversationContext(fakeConversationContext),
      );
      const MockApp = await importApp(overrides);

      // Act
      const app = new MockApp({ authorize: noopAuthorize, signingSecret: '' });

      // Assert
      assert.instanceOf(app, MockApp);
      assert(fakeMemoryStore.calledWithNew);
      assert(fakeConversationContext.called);
    });
    it('should initialize without a conversation store when option is false', async () => {
      // Arrange
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withConversationContext(fakeConversationContext),
      );
      const MockApp = await importApp(overrides);

      // Act
      const app = new MockApp({ convoStore: false, authorize: noopAuthorize, signingSecret: '' });

      // Assert
      assert.instanceOf(app, MockApp);
      assert(fakeConversationContext.notCalled);
    });
    describe('with a custom conversation store', () => {
      it('should initialize the conversation store', async () => {
        // Arrange
        const fakeConversationContext = sinon.fake.returns(noopMiddleware);
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withNoopWebClient(),
          withConversationContext(fakeConversationContext),
        );
        const dummyConvoStore = Symbol() as unknown as ConversationStore;
        const MockApp = await importApp(overrides);

        // Act
        const app = new MockApp({ convoStore: dummyConvoStore, authorize: noopAuthorize, signingSecret: '' });

        // Assert
        assert.instanceOf(app, MockApp);
        assert(fakeConversationContext.firstCall.calledWith(dummyConvoStore));
      });
    });
    describe('with custom redirectUri supplied', () => {
      it('should fail when missing installerOptions', async () => {
        // Arrange
        const MockApp = await importApp();

        // Act
        try {
          new MockApp({ token: '', signingSecret: '', redirectUri: 'http://example.com/redirect' }); // eslint-disable-line no-new
          assert.fail();
        } catch (error: any) {
          // Assert
          assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        }
      });
      it('should fail when missing installerOptions.redirectUriPath', async () => {
        // Arrange
        const MockApp = await importApp();

        // Act
        try {
          new MockApp({ token: '', signingSecret: '', redirectUri: 'http://example.com/redirect', installerOptions: {} }); // eslint-disable-line no-new
          assert.fail();
        } catch (error: any) {
          // Assert
          assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        }
      });
    });
    it('with clientOptions', async () => {
      const fakeConstructor = sinon.fake();
      const overrides = mergeOverrides(withNoopAppMetadata(), {
        '@slack/web-api': {
          WebClient: class {
            public constructor() {
              fakeConstructor(...arguments); // eslint-disable-line prefer-rest-params
            }
          },
        },
      });

      const MockApp = await importApp(overrides);

      const clientOptions = { slackApiUrl: 'proxy.slack.com' };

      new MockApp({ clientOptions, authorize: noopAuthorize, signingSecret: '', logLevel: LogLevel.ERROR }); // eslint-disable-line no-new

      assert.ok(fakeConstructor.called);

      const [token, options] = fakeConstructor.lastCall.args;
      assert.strictEqual(undefined, token, 'token should be undefined');
      assert.strictEqual(clientOptions.slackApiUrl, options.slackApiUrl);
      assert.strictEqual(LogLevel.ERROR, options.logLevel, 'override logLevel');
    });
    it('should not perform auth.test API call if tokenVerificationEnabled is false', async () => {
      // Arrange
      const fakeConstructor = sinon.fake();
      const overrides = mergeOverrides(withNoopAppMetadata(), {
        '@slack/web-api': {
          WebClient: class {
            public constructor() {
              fakeConstructor(...arguments); // eslint-disable-line prefer-rest-params
            }

            public auth = {
              test: () => {
                throw new Error('This API method call should not be performed');
              },
            };
          },
        },
      });

      const MockApp = await importApp(overrides);
      const app = new MockApp({
        token: 'xoxb-completely-invalid-token',
        signingSecret: 'invalid-one',
        tokenVerificationEnabled: false,
      });
      // Assert
      assert.instanceOf(app, MockApp);
    });

    it('should fail in await App#init()', async () => {
      // Arrange
      const fakeConstructor = sinon.fake();
      const overrides = mergeOverrides(withNoopAppMetadata(), {
        '@slack/web-api': {
          WebClient: class {
            public constructor() {
              fakeConstructor(...arguments); // eslint-disable-line prefer-rest-params
            }

            public auth = {
              test: () => {
                throw new Error('Failing for init() test!');
              },
            };
          },
        },
      });

      const MockApp = await importApp(overrides);
      const app = new MockApp({
        token: 'xoxb-completely-invalid-token',
        signingSecret: 'invalid-one',
        deferInitialization: true,
      });
      // Assert
      assert.instanceOf(app, MockApp);
      try {
        // call #start() before #init()
        await app.start();
        assert.fail('The start() method should fail before init() call');
      } catch (err: any) {
        assert.equal(err.message, 'This App instance is not yet initialized. Call `await App#init()` before starting the app.');
      }
      try {
        await app.init();
        assert.fail('The init() method should fail here');
      } catch (err: any) {
        assert.equal(err.message, 'Failing for init() test!');
      }
    });

    describe('with developerMode', () => {
      it('should accept developerMode: true', async () => {
        // Arrange
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withSuccessfulBotUserFetchingWebClient('B_FAKE_BOT_ID', 'U_FAKE_BOT_USER_ID'),
        );
        const fakeLogger = createFakeLogger();
        const MockApp = await importApp(overrides);
        // Act
        const app = new MockApp({ logger: fakeLogger, token: '', appToken: '', developerMode: true });
        // Assert
        assert.equal((app as any).logLevel, LogLevel.DEBUG);
        assert.equal((app as any).socketMode, true);
      });
    });

    // TODO: tests for ignoreSelf option
    // TODO: tests for logger and logLevel option
    // TODO: tests for providing botId and botUserId options
    // TODO: tests for providing endpoints option
  });

  describe('#start', () => {
    // The following test case depends on a definition of App that is generic on its Receiver type. This will be
    // addressed in the future. It cannot even be left uncommented with the `it.skip()` global because it will fail
    // TypeScript compilation as written.
    // it('should pass calls through to receiver', async () => {
    //   // Arrange
    //   const dummyReturn = Symbol();
    //   const dummyParams = [Symbol(), Symbol()];
    //   const fakeReceiver = new FakeReceiver();
    //   const MockApp = await importApp();
    //   const app = new MockApp({ receiver: fakeReceiver, authorize: noopAuthorize });
    //   fakeReceiver.start = sinon.fake.returns(dummyReturn);
    //   // Act
    //   const actualReturn = await app.start(...dummyParams);
    //   // Assert
    //   assert.deepEqual(actualReturn, dummyReturn);
    //   assert.deepEqual(dummyParams, fakeReceiver.start.firstCall.args);
    // });
    // TODO: another test case to take the place of the one above (for coverage until the definition of App is made
    // generic).
  });

  describe('#stop', () => {
    it('should pass calls through to receiver', async () => {
      // Arrange
      const dummyReturn = Symbol();
      const dummyParams = [Symbol(), Symbol()];
      const fakeReceiver = new FakeReceiver();
      const MockApp = await importApp();
      fakeReceiver.stop = sinon.fake.returns(dummyReturn);

      // Act
      const app = new MockApp({ receiver: fakeReceiver, authorize: noopAuthorize });
      const actualReturn = await app.stop(...dummyParams);

      // Assert
      assert.deepEqual(actualReturn, dummyReturn);
      assert.deepEqual(dummyParams, fakeReceiver.stop.firstCall.args);
    });
  });

  let fakeReceiver: FakeReceiver;
  let fakeErrorHandler: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };

  beforeEach(() => {
    fakeReceiver = new FakeReceiver();
    fakeErrorHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
  });

  describe('middleware and listener arguments', () => {
    const dummyChannelId = 'CHANNEL_ID';
    let overrides: Override;
    const baseEvent = createDummyReceiverEvent();

    function buildOverrides(secondOverrides: Override[]): Override {
      overrides = mergeOverrides(
        withNoopAppMetadata(),
        ...secondOverrides,
        withMemoryStore(sinon.fake()),
        withConversationContext(sinon.fake.returns(noopMiddleware)),
      );
      return overrides;
    }

    describe('respond()', () => {
      it('should respond to events with a response_url', async () => {
        // Arrange
        const responseText = 'response';
        const responseUrl = 'https://fake.slack/response_url';
        const actionId = 'block_action_id';
        const fakeAxiosPost = sinon.fake.resolves({});
        overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
        const MockApp = await importApp(overrides);

        // Act
        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.action(actionId, async ({ respond }) => {
          await respond(responseText);
        });
        app.error(fakeErrorHandler);
        await fakeReceiver.sendEvent({
          // IncomingEventType.Action (app.action)
          body: {
            type: 'block_actions',
            response_url: responseUrl,
            actions: [
              {
                action_id: actionId,
              },
            ],
            channel: {},
            user: {},
            team: {},
          },
          ack: noop,
        });

        // Assert
        assert(fakeErrorHandler.notCalled);
        assert.equal(fakeAxiosPost.callCount, 1);
        // Assert that each call to fakeAxiosPost had the right arguments
        assert(fakeAxiosPost.calledWith(responseUrl, { text: responseText }));
      });

      it('should respond with a response object', async () => {
        // Arrange
        const responseObject = { text: 'response' };
        const responseUrl = 'https://fake.slack/response_url';
        const actionId = 'block_action_id';
        const fakeAxiosPost = sinon.fake.resolves({});
        overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
        const MockApp = await importApp(overrides);

        // Act
        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.action(actionId, async ({ respond }) => {
          await respond(responseObject);
        });
        app.error(fakeErrorHandler);
        await fakeReceiver.sendEvent({
          // IncomingEventType.Action (app.action)
          body: {
            type: 'block_actions',
            response_url: responseUrl,
            actions: [
              {
                action_id: actionId,
              },
            ],
            channel: {},
            user: {},
            team: {},
          },
          ack: noop,
        });

        // Assert
        assert.equal(fakeAxiosPost.callCount, 1);
        // Assert that each call to fakeAxiosPost had the right arguments
        assert(fakeAxiosPost.calledWith(responseUrl, responseObject));
      });
      it('should be able to use respond for view_submission payloads', async () => {
        // Arrange
        const responseObject = { text: 'response' };
        const responseUrl = 'https://fake.slack/response_url';
        const fakeAxiosPost = sinon.fake.resolves({});
        overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
        const MockApp = await importApp(overrides);

        // Act
        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.view('view-id', async ({ respond }) => {
          await respond(responseObject);
        });
        app.error(fakeErrorHandler);
        await fakeReceiver.sendEvent({
          ack: noop,
          body: {
            type: 'view_submission',
            team: {},
            user: {},
            view: {
              id: 'V111',
              type: 'modal',
              callback_id: 'view-id',
              state: {},
              title: {},
              close: {},
              submit: {},
            },
            response_urls: [
              {
                block_id: 'b',
                action_id: 'a',
                channel_id: 'C111',
                response_url: 'https://fake.slack/response_url',
              },
            ],
          },
        });

        // Assert
        assert.equal(fakeAxiosPost.callCount, 1);
        // Assert that each call to fakeAxiosPost had the right arguments
        assert(fakeAxiosPost.calledWith(responseUrl, responseObject));
      });
    });

    describe('logger', () => {
      it('should be available in middleware/listener args', async () => {
        // Arrange
        const MockApp = await importApp(overrides);
        const fakeLogger = createFakeLogger();
        const app = new MockApp({
          logger: fakeLogger,
          receiver: fakeReceiver,
          authorize: sinon.fake.resolves(dummyAuthorizationResult),
        });
        app.use(async ({ logger, body, next }) => {
          logger.info(body);
          await next();
        });

        app.event('app_home_opened', async ({ logger, event }) => {
          logger.debug(event);
        });

        const receiverEvents = [
          {
            body: {
              type: 'event_callback',
              token: 'XXYYZZ',
              team_id: 'TXXXXXXXX',
              api_app_id: 'AXXXXXXXXX',
              event: {
                type: 'app_home_opened',
                event_ts: '1234567890.123456',
                user: 'UXXXXXXX1',
                text: 'hello friends!',
                tab: 'home',
                view: {},
              },
            },
            respond: noop,
            ack: noop,
          },
        ];

        // Act
        await Promise.all(receiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        // Assert
        assert.isTrue(fakeLogger.info.called);
        assert.isTrue(fakeLogger.debug.called);
      });

      it('should work in the case both logger and logLevel are given', async () => {
        // Arrange
        const MockApp = await importApp(overrides);
        const fakeLogger = createFakeLogger();
        const app = new MockApp({
          logger: fakeLogger,
          logLevel: LogLevel.DEBUG,
          receiver: fakeReceiver,
          authorize: sinon.fake.resolves(dummyAuthorizationResult),
        });
        app.use(async ({ logger, body, next }) => {
          logger.info(body);
          await next();
        });

        app.event('app_home_opened', async ({ logger, event }) => {
          logger.debug(event);
        });

        const receiverEvents = [
          {
            body: {
              type: 'event_callback',
              token: 'XXYYZZ',
              team_id: 'TXXXXXXXX',
              api_app_id: 'AXXXXXXXXX',
              event: {
                type: 'app_home_opened',
                event_ts: '1234567890.123456',
                user: 'UXXXXXXX1',
                text: 'hello friends!',
                tab: 'home',
                view: {},
              },
            },
            respond: noop,
            ack: noop,
          },
        ];

        // Act
        await Promise.all(receiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        // Assert
        assert.isTrue(fakeLogger.info.called);
        assert.isTrue(fakeLogger.debug.called);
        assert.isTrue(fakeLogger.setLevel.called);
      });
    });

    describe('client', () => {
      it('should be available in middleware/listener args', async () => {
        // Arrange
        const MockApp = await importApp(
          mergeOverrides(
            withNoopAppMetadata(),
            withSuccessfulBotUserFetchingWebClient('B123', 'U123'),
          ),
        );
        const tokens = ['xoxb-123', 'xoxp-456', 'xoxb-123'];
        const app = new MockApp({
          receiver: fakeReceiver,
          authorize: () => {
            const token = tokens.pop();
            if (typeof token === 'undefined') {
              return Promise.resolve({ botId: 'B123' });
            }
            if (token.startsWith('xoxb-')) {
              return Promise.resolve({ botToken: token, botId: 'B123' });
            }
            return Promise.resolve({ userToken: token, botId: 'B123' });
          },
        });
        app.use(async ({ client, next }) => {
          await client.auth.test();
          await next();
        });
        const clients: WebClient[] = [];
        app.event('app_home_opened', async ({ client }) => {
          clients.push(client);
          await client.auth.test();
        });

        const event = {
          body: {
            type: 'event_callback',
            token: 'legacy',
            team_id: 'T123',
            api_app_id: 'A123',
            event: {
              type: 'app_home_opened',
              event_ts: '123.123',
              user: 'U123',
              text: 'Hi there!',
              tab: 'home',
              view: {},
            },
          },
          respond: noop,
          ack: noop,
        };
        const receiverEvents = [event, event, event];

        // Act
        await Promise.all(receiverEvents.map((evt) => fakeReceiver.sendEvent(evt)));

        // Assert
        assert.isUndefined(app.client.token);

        assert.equal(clients[0].token, 'xoxb-123');
        assert.equal(clients[1].token, 'xoxp-456');
        assert.equal(clients[2].token, 'xoxb-123');

        assert.notEqual(clients[0], clients[1]);
        assert.strictEqual(clients[0], clients[2]);
      });

      it("should be to the global app client when authorization doesn't produce a token", async () => {
        // Arrange
        const MockApp = await importApp();
        const app = new MockApp({
          receiver: fakeReceiver,
          authorize: noopAuthorize,
          ignoreSelf: false,
        });
        const globalClient = app.client;

        // Act
        let clientArg: WebClient | undefined;
        app.use(async ({ client }) => {
          clientArg = client;
        });
        await fakeReceiver.sendEvent(createDummyReceiverEvent());

        // Assert
        assert.equal(globalClient, clientArg);
      });
    });

    describe('say()', () => {
      function createChannelContextualReceiverEvents(channelId: string): ReceiverEvent[] {
        return [
          // IncomingEventType.Event with channel in payload
          {
            ...baseEvent,
            body: {
              event: {
                channel: channelId,
              },
              team_id: 'TEAM_ID',
            },
          },
          // IncomingEventType.Event with channel in item
          {
            ...baseEvent,
            body: {
              event: {
                item: {
                  channel: channelId,
                },
              },
              team_id: 'TEAM_ID',
            },
          },
          // IncomingEventType.Command
          {
            ...baseEvent,
            body: {
              command: '/COMMAND_NAME',
              channel_id: channelId,
              team_id: 'TEAM_ID',
            },
          },
          // IncomingEventType.Action from block action, interactive message, or message action
          {
            ...baseEvent,
            body: {
              actions: [{}],
              channel: {
                id: channelId,
              },
              user: {
                id: 'USER_ID',
              },
              team: {
                id: 'TEAM_ID',
              },
            },
          },
          // IncomingEventType.Action from dialog submission
          {
            ...baseEvent,
            body: {
              type: 'dialog_submission',
              channel: {
                id: channelId,
              },
              user: {
                id: 'USER_ID',
              },
              team: {
                id: 'TEAM_ID',
              },
            },
          },
        ];
      }

      it('should send a simple message to a channel where the incoming event originates', async () => {
        // Arrange
        const fakePostMessage = sinon.fake.resolves({});
        overrides = buildOverrides([withPostMessage(fakePostMessage)]);
        const MockApp = await importApp(overrides);

        const dummyMessage = 'test';
        const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

        // Act
        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          // By definition, these events should all produce a say function, so we cast args.say into a SayFn
          const say = (args as any).say as SayFn;
          await say(dummyMessage);
        });
        app.error(fakeErrorHandler);
        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        // Assert
        assert.equal(fakePostMessage.callCount, dummyReceiverEvents.length);
        // Assert that each call to fakePostMessage had the right arguments
        fakePostMessage.getCalls().forEach((call) => {
          const firstArg = call.args[0];
          assert.propertyVal(firstArg, 'text', dummyMessage);
          assert.propertyVal(firstArg, 'channel', dummyChannelId);
        });
        assert(fakeErrorHandler.notCalled);
      });

      it('should send a complex message to a channel where the incoming event originates', async () => {
        // Arrange
        const fakePostMessage = sinon.fake.resolves({});
        overrides = buildOverrides([withPostMessage(fakePostMessage)]);
        const MockApp = await importApp(overrides);

        const dummyMessage = { text: 'test' };
        const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

        // Act
        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          // By definition, these events should all produce a say function, so we cast args.say into a SayFn
          const say = (args as any).say as SayFn;
          await say(dummyMessage);
        });
        app.error(fakeErrorHandler);
        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        // Assert
        assert.equal(fakePostMessage.callCount, dummyReceiverEvents.length);
        // Assert that each call to fakePostMessage had the right arguments
        fakePostMessage.getCalls().forEach((call) => {
          const firstArg = call.args[0];
          assert.propertyVal(firstArg, 'channel', dummyChannelId);
          Object.keys(dummyMessage).forEach((prop) => {
            assert.propertyVal(firstArg, prop, (dummyMessage as any)[prop]);
          });
        });
        assert(fakeErrorHandler.notCalled);
      });

      function createReceiverEventsWithoutSay(channelId: string): ReceiverEvent[] {
        return [
          // IncomingEventType.Options from block action
          {
            ...baseEvent,
            body: {
              type: 'block_suggestion',
              channel: {
                id: channelId,
              },
              user: {
                id: 'USER_ID',
              },
              team: {
                id: 'TEAM_ID',
              },
            },
          },
          // IncomingEventType.Options from interactive message or dialog
          {
            ...baseEvent,
            body: {
              name: 'select_field_name',
              channel: {
                id: channelId,
              },
              user: {
                id: 'USER_ID',
              },
              team: {
                id: 'TEAM_ID',
              },
            },
          },
          // IncomingEventType.Event without a channel context
          {
            ...baseEvent,
            body: {
              event: {},
              team_id: 'TEAM_ID',
            },
          },
        ];
      }

      it("should not exist in the arguments on incoming events that don't support say", async () => {
        // Arrange
        overrides = buildOverrides([withNoopWebClient()]);
        const MockApp = await importApp(overrides);

        const assertionAggregator = sinon.fake();
        const dummyReceiverEvents = createReceiverEventsWithoutSay(dummyChannelId);

        // Act
        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          assert.isUndefined((args as any).say);
          // If the above assertion fails, then it would throw an AssertionError and the following line will not be
          // called
          assertionAggregator();
        });

        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        // Assert
        assert.equal(assertionAggregator.callCount, dummyReceiverEvents.length);
      });

      it("should handle failures through the App's global error handler", async () => {
        // Arrange
        const fakePostMessage = sinon.fake.rejects(new Error('fake error'));
        overrides = buildOverrides([withPostMessage(fakePostMessage)]);
        const MockApp = await importApp(overrides);

        const dummyMessage = { text: 'test' };
        const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

        // Act
        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          // By definition, these events should all produce a say function, so we cast args.say into a SayFn
          const say = (args as any).say as SayFn;
          await say(dummyMessage);
        });
        app.error(fakeErrorHandler);
        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        // Assert
        assert.equal(fakeErrorHandler.callCount, dummyReceiverEvents.length);
      });
    });

    describe('ack()', () => {
      it('should be available in middleware/listener args', async () => {
        // Arrange
        const MockApp = await importApp(overrides);
        const fakeLogger = createFakeLogger();
        const app = new MockApp({
          logger: fakeLogger,
          receiver: fakeReceiver,
          authorize: sinon.fake.resolves(dummyAuthorizationResult),
        });
        app.use(async ({ ack, next }) => {
          if (ack) {
            // this should be called even if app.view listeners do not exist
            await ack();
            return;
          }
          fakeLogger.info('Events API');
          await next();
        });

        app.event('app_home_opened', async ({ logger, event }) => {
          logger.debug(event);
        });

        let ackInMiddlewareCalled = false;

        const receiverEvents = [
          {
            body: {
              type: 'event_callback',
              token: 'XXYYZZ',
              team_id: 'TXXXXXXXX',
              api_app_id: 'AXXXXXXXXX',
              event: {
                type: 'app_home_opened',
                event_ts: '1234567890.123456',
                user: 'UXXXXXXX1',
                text: 'hello friends!',
                tab: 'home',
                view: {},
              },
            },
            respond: noop,
            ack: noop,
          },
          {
            body: {
              type: 'view_submission',
              team: {},
              user: {},
              view: {
                id: 'V111',
                type: 'modal',
                callback_id: 'view-id',
                state: {},
                title: {},
                close: {},
                submit: {},
              },
            },
            respond: noop,
            ack: async () => {
              ackInMiddlewareCalled = true;
            },
          },
        ];

        // Act
        await Promise.all(
          receiverEvents.map((event) => fakeReceiver.sendEvent(event)),
        );

        // Assert
        assert.isTrue(fakeLogger.info.called);
        assert.isTrue(ackInMiddlewareCalled);
      });
    });

    describe('context', () => {
      it('should be able to use the app_installed_team_id when provided by the payload', async () => {
        // Arrange
        const fakeAxiosPost = sinon.fake.resolves({});
        overrides = buildOverrides([
          withNoopWebClient(),
          withAxiosPost(fakeAxiosPost),
        ]);
        const MockApp = await importApp(overrides);

        // Act
        const app = new MockApp({
          receiver: fakeReceiver,
          authorize: sinon.fake.resolves(dummyAuthorizationResult),
        });

        app.view('view-id', async ({ ack, context, view }) => {
          assert.equal('T-installed-workspace', context.teamId);
          assert.notEqual('T-installed-workspace', view.team_id);
          await ack();
        });
        app.error(fakeErrorHandler);

        let ackCalled = false;

        const receiverEvent = {
          ack: async () => {
            ackCalled = true;
          },
          body: {
            type: 'view_submission',
            team: {},
            user: {},
            view: {
              id: 'V111',
              type: 'modal',
              callback_id: 'view-id',
              state: {},
              title: {},
              close: {},
              submit: {},
              app_installed_team_id: 'T-installed-workspace',
            },
          },
        };

        // Act
        await fakeReceiver.sendEvent(receiverEvent);

        // Assert
        assert.isTrue(ackCalled);
      });
    });
  });
});

/* Testing Harness */

// Loading the system under test using overrides
async function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata(), withNoopWebClient()),
): Promise<typeof import('./App').default> {
  return (await rewiremock.module(() => import('./App'), overrides)).default;
}

// Composable overrides
function withNoopWebClient(): Override {
  return {
    '@slack/web-api': {
      WebClient: class {},
    },
  };
}

function withNoopAppMetadata(): Override {
  return {
    '@slack/web-api': {
      addAppMetadata: sinon.fake(),
    },
  };
}

function withSuccessfulBotUserFetchingWebClient(botId: string, botUserId: string): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public token?: string;

        public constructor(token?: string, _options?: WebClientOptions) {
          this.token = token;
        }

        public auth = {
          test: sinon.fake.resolves({ user_id: botUserId }),
        };

        public users = {
          info: sinon.fake.resolves({
            user: {
              profile: {
                bot_id: botId,
              },
            },
          }),
        };
      },
    },
  };
}

function withPostMessage(spy: SinonSpy): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public chat = {
          postMessage: spy,
        };
      },
    },
  };
}

function withAxiosPost(spy: SinonSpy): Override {
  return {
    axios: {
      create: () => ({
        post: spy,
      }),
    },
  };
}

function withMemoryStore(spy: SinonSpy): Override {
  return {
    './conversation-store': {
      MemoryStore: spy,
    },
  };
}

function withConversationContext(spy: SinonSpy): Override {
  return {
    './conversation-store': {
      conversationContext: spy,
    },
  };
}
