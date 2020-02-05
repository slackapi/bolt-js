// tslint:disable:no-implicit-dependencies
import 'mocha';
import { EventEmitter } from 'events';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import { Override, mergeOverrides, createFakeLogger, delay } from './test-helpers';
import rewiremock from 'rewiremock';
import { ErrorCode } from './errors';
import { Receiver, ReceiverEvent, SayFn, NextMiddleware } from './types';
import { ConversationStore } from './conversation-store';
import { LogLevel } from '@slack/logger';
import { ViewConstraints } from './App';
import { WebClientOptions, WebClient } from '@slack/web-api';

describe('App', () => {
  describe('constructor', () => {
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
        const App = await importApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ token: '', signingSecret: '' });

        // Assert
        // TODO: verify that the fake bot ID and fake bot user ID are retrieved
        assert.instanceOf(app, App);
      });
    });
    it('should succeed with an authorize callback', async () => {
      // Arrange
      const authorizeCallback = sinon.fake();
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ authorize: authorizeCallback, signingSecret: '' });

      // Assert
      assert(authorizeCallback.notCalled, 'Should not call the authorize callback on instantiation');
      assert.instanceOf(app, App);
    });
    it('should fail without a token for single team authorization or authorize callback', async () => {
      // Arrange
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      try {
        new App({ signingSecret: '' }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both a token and authorize callback are specified', async () => {
      // Arrange
      const authorizeCallback = sinon.fake();
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      try {
        // tslint:disable-next-line:no-unused-expression
        new App({ token: '', authorize: authorizeCallback, signingSecret: '' });
        assert.fail();
      } catch (error) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    describe('with a custom receiver', () => {
      it('should succeed with no signing secret', async () => {
        // Arrange
        const App = await importApp(); // tslint:disable-line:variable-name

        // Act
        const app = new App({ receiver: createFakeReceiver(), authorize: noopAuthorize });

        // Assert
        assert.instanceOf(app, App);
      });
    });
    it('should fail when no signing secret for the default receiver is specified', async () => {
      // Arrange
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      try {
        new App({ authorize: noopAuthorize }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
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
      const App = await importApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ authorize: noopAuthorize, signingSecret: '' });

      // Assert
      assert.instanceOf(app, App);
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
      const App = await importApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ convoStore: false, authorize: noopAuthorize, signingSecret: '' });

      // Assert
      assert.instanceOf(app, App);
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
        const App = await importApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ convoStore: dummyConvoStore, authorize: noopAuthorize, signingSecret: '' });

        // Assert
        assert.instanceOf(app, App);
        assert(fakeConversationContext.firstCall.calledWith(dummyConvoStore));
      });
    });
    it('with clientOptions', async () => {
      const fakeConstructor = sinon.fake();
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        {
          '@slack/web-api': {
            WebClient: class {
              constructor() {
                fakeConstructor(...arguments);
              }
            },
          },
        },
      );
      // tslint:disable-next-line: variable-name
      const App = await importApp(overrides);

      const clientOptions = { slackApiUrl: 'proxy.slack.com' };
      // tslint:disable-next-line: no-unused-expression
      new App({ clientOptions, authorize: noopAuthorize, signingSecret: '', logLevel: LogLevel.ERROR });

      assert.ok(fakeConstructor.called);

      const [token, options] = fakeConstructor.lastCall.args;
      assert.strictEqual(undefined, token, 'token should be undefined');
      assert.strictEqual(clientOptions.slackApiUrl, options.slackApiUrl);
      assert.strictEqual(LogLevel.ERROR, options.logLevel, 'override logLevel');
    });
    // TODO: tests for ignoreSelf option
    // TODO: tests for logger and logLevel option
    // TODO: tests for providing botId and botUserId options
    // TODO: tests for providing endpoints option
  });

  describe('#start', () => {
    it('should pass calls through to receiver', async () => {
      // Arrange
      const dummyReturn = Symbol();
      const dummyParams = [Symbol(), Symbol()];
      const fakeReceiver = createFakeReceiver(sinon.fake.resolves(dummyReturn));
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, authorize: noopAuthorize });
      const actualReturn = await app.start(...dummyParams);

      // Assert
      assert.equal(actualReturn, dummyReturn);
      assert.deepEqual(dummyParams, fakeReceiver.start.firstCall.args);
    });
  });

  describe('#stop', () => {
    it('should pass calls through to receiver', async () => {
      // Arrange
      const dummyReturn = Symbol();
      const dummyParams = [Symbol(), Symbol()];
      const fakeReceiver = createFakeReceiver(undefined, sinon.fake.resolves(dummyReturn));
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, authorize: noopAuthorize });
      const actualReturn = await app.stop(...dummyParams);

      // Assert
      assert.equal(actualReturn, dummyReturn);
      assert.deepEqual(dummyParams, fakeReceiver.stop.firstCall.args);
    });
  });

  describe('event processing', () => {
    // TODO: verify that authorize callback is called with the correct properties and responds correctly to
    // various return values

    function createInvalidReceiverEvents(): ReceiverEvent[] {
      // TODO: create many more invalid receiver events (fuzzing)
      return [{
        body: {},
        ack: sinon.fake.resolves(undefined),
      }];
    }

    it('should warn and skip when processing a receiver event with unknown type (never crash)', async () => {
      // Arrange
      const fakeReceiver = createFakeReceiver();
      const fakeLogger = createFakeLogger();
      const fakeMiddleware = sinon.fake(noopMiddleware);
      const invalidReceiverEvents = createInvalidReceiverEvents();
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, logger: fakeLogger, authorize: noopAuthorize });
      app.use(fakeMiddleware);
      for (const event of invalidReceiverEvents) {
        fakeReceiver.emit('message', event);
      }

      // Assert
      assert(fakeMiddleware.notCalled);
      assert.isAtLeast(fakeLogger.warn.callCount, invalidReceiverEvents.length);
    });
    it('should warn, send to global error handler, and skip when a receiver event fails authorization', async () => {
      // Arrange
      const fakeReceiver = createFakeReceiver();
      const fakeLogger = createFakeLogger();
      const fakeMiddleware = sinon.fake(noopMiddleware);
      const fakeErrorHandler = sinon.fake();
      const dummyAuthorizationError = new Error();
      const dummyReceiverEvent = createDummyReceiverEvent();
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({
        receiver: fakeReceiver,
        logger: fakeLogger,
        authorize: sinon.fake.rejects(dummyAuthorizationError),
      });
      app.use(fakeMiddleware);
      app.error(fakeErrorHandler);
      fakeReceiver.emit('message', dummyReceiverEvent);
      await delay();

      // Assert
      assert(fakeMiddleware.notCalled);
      assert(fakeLogger.warn.called);
      assert.instanceOf(fakeErrorHandler.firstCall.args[0], Error);
      assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'code', ErrorCode.AuthorizationError);
      assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'original', dummyAuthorizationError);
    });
    describe('global middleware', () => {
      it('should process receiver events in order of #use', async () => {
        // Arrange
        const fakeReceiver = createFakeReceiver();
        const fakeFirstMiddleware = sinon.fake(noopMiddleware);
        const fakeSecondMiddleware = sinon.fake(noopMiddleware);
        const dummyReceiverEvent = createDummyReceiverEvent();
        const dummyAuthorizationResult = { botToken: '', botId: '' };
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withNoopWebClient(),
          withMemoryStore(sinon.fake()),
          withConversationContext(sinon.fake.returns(noopMiddleware)),
        );
        const App = await importApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(fakeFirstMiddleware);
        app.use(fakeSecondMiddleware);
        fakeReceiver.emit('message', dummyReceiverEvent);
        await delay();

        // Assert
        assert(fakeFirstMiddleware.calledOnce);
        assert(fakeFirstMiddleware.calledBefore(fakeSecondMiddleware));
        assert(fakeSecondMiddleware.calledOnce);
      });
    });

    describe('middleware and listener arguments', () => {

      let fakeReceiver: FakeReceiver;
      let fakeErrorHandler: SinonSpy;
      let dummyAuthorizationResult: { [key: string]: any };
      const dummyChannelId = 'CHANNEL_ID';
      let overrides: Override;

      function buildOverrides(secondOverrides: Override[]): Override {
        fakeReceiver = createFakeReceiver();
        fakeErrorHandler = sinon.fake();
        dummyAuthorizationResult = { botToken: '', botId: '' };
        overrides = mergeOverrides(
          withNoopAppMetadata(),
          ...secondOverrides,
          withMemoryStore(sinon.fake()),
          withConversationContext(sinon.fake.returns(noopMiddleware)),
        );
        return overrides;
      }

      describe('routing', () => {

        function createReceiverEvents(): ReceiverEvent[] {
          return [
            { // IncomingEventType.Event (app.event)
              body: {
                event: {},
              },
              ack: noop,
            },
            { // IncomingEventType.Command (app.command)
              body: {
                command: '/COMMAND_NAME',
              },
              ack: noop,
            },
            { // IncomingEventType.Action (app.action)
              body: {
                type: 'block_actions',
                actions: [{
                  action_id: 'block_action_id',
                }],
                channel: {},
                user: {},
                team: {},
              },
              ack: noop,
            },
            { // IncomingEventType.Action (app.action)
              body: {
                type: 'message_action',
                callback_id: 'message_action_callback_id',
                channel: {},
                user: {},
                team: {},
              },
              ack: noop,
            },
            { // IncomingEventType.Action (app.action)
              body: {
                type: 'message_action',
                callback_id: 'another_message_action_callback_id',
                channel: {},
                user: {},
                team: {},
              },
              ack: noop,
            },
            { // IncomingEventType.Action (app.action)
              body: {
                type: 'interactive_message',
                callback_id: 'interactive_message_callback_id',
                actions: [{}],
                channel: {},
                user: {},
                team: {},
              },
              ack: noop,
            },
            { // IncomingEventType.Action with dialog submission (app.action)
              body: {
                type: 'dialog_submission',
                callback_id: 'dialog_submission_callback_id',
                channel: {},
                user: {},
                team: {},
              },
              ack: noop,
            },
            { // IncomingEventType.Action for an external_select block (app.options)
              body: {
                type: 'block_suggestion',
                action_id: 'external_select_action_id',
                channel: {},
                user: {},
                team: {},
                actions: [],
              },
              ack: noop,
            },
            { // IncomingEventType.Action for "data_source": "external" in dialogs (app.options)
              body: {
                type: 'dialog_suggestion',
                callback_id: 'dialog_suggestion_callback_id',
                name: 'the name',
                channel: {},
                user: {},
                team: {},
              },
              ack: noop,
            },
            { // IncomingEventType.ViewSubmitAction (app.view)
              body: {
                type: 'view_submission',
                channel: {},
                user: {},
                team: {},
                view: {
                  callback_id: 'view_callback_id',
                },
              },
              ack: noop,
            },
            {
              body: {
                type: 'view_closed',
                channel: {},
                user: {},
                team: {},
                view: {
                  callback_id: 'view_callback_id',
                },
              },
              ack: noop,
            },
            {
              body: {
                type: 'event_callback',
                token: 'XXYYZZ',
                team_id: 'TXXXXXXXX',
                api_app_id: 'AXXXXXXXXX',
                event: {
                  type: 'message',
                  event_ts: '1234567890.123456',
                  user: 'UXXXXXXX1',
                  text: 'hello friends!',
                },
              },
              ack: noop,
            },
          ];
        }

        it('should acknowledge any of possible events', async () => {
          // Arrange
          const ackFn = sinon.fake.resolves({});
          const actionFn = sinon.fake.resolves({});
          const viewFn = sinon.fake.resolves({});
          const optionsFn = sinon.fake.resolves({});
          const overrides = buildOverrides([withNoopWebClient()]);
          const App = await importApp(overrides); // tslint:disable-line:variable-name
          const dummyReceiverEvents = createReceiverEvents();

          // Act
          const fakeLogger = createFakeLogger();
          const app = new App({
            logger: fakeLogger,
            receiver: fakeReceiver,
            authorize: sinon.fake.resolves(dummyAuthorizationResult),
          });

          app.use((_args) => { ackFn(); });
          app.action('block_action_id', ({ }) => { actionFn(); });
          app.action({ callback_id: 'message_action_callback_id' }, ({ }) => { actionFn(); });
          app.action(
            { type: 'message_action', callback_id: 'another_message_action_callback_id' },
            ({ }) => { actionFn(); });
          app.action({ type: 'message_action', callback_id: 'does_not_exist' }, ({ }) => { actionFn(); });
          app.action({ callback_id: 'interactive_message_callback_id' }, ({ }) => { actionFn(); });
          app.action({ callback_id: 'dialog_submission_callback_id' }, ({ }) => { actionFn(); });
          app.view('view_callback_id', ({ }) => { viewFn(); });
          app.view({ callback_id: 'view_callback_id', type: 'view_closed' }, ({ }) => { viewFn(); });
          app.options('external_select_action_id', ({ }) => { optionsFn(); });
          app.options({ callback_id: 'dialog_suggestion_callback_id' }, ({ }) => { optionsFn(); });

          app.event('app_home_opened', ({ }) => { /* noop */ });
          app.message('hello', ({ }) => { /* noop */ });
          app.command('/echo', ({ }) => { /* noop */ });

          // invalid view constraints
          const invalidViewConstraints1 = {
            callback_id: 'foo',
            type: 'view_submission',
            unknown_key: 'should be detected',
          } as any as ViewConstraints;
          app.view(invalidViewConstraints1, ({ }) => { /* noop */ });
          assert.isTrue(fakeLogger.error.called);

          fakeLogger.error = sinon.fake();

          const invalidViewConstraints2 = {
            callback_id: 'foo',
            type: undefined,
            unknown_key: 'should be detected',
          } as any as ViewConstraints;
          app.view(invalidViewConstraints2, ({ }) => { /* noop */ });
          assert.isTrue(fakeLogger.error.called);

          app.error(fakeErrorHandler);
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

          // Assert
          assert.equal(actionFn.callCount, 5);
          assert.equal(viewFn.callCount, 2);
          assert.equal(optionsFn.callCount, 2);
          assert.equal(ackFn.callCount, dummyReceiverEvents.length);
          assert(fakeErrorHandler.notCalled);
        });
      });

      describe('respond()', () => {
        it('should respond to events with a response_url', async () => {
          // Arrange
          const responseText = 'response';
          const responseUrl = 'https://fake.slack/response_url';
          const actionId = 'block_action_id';
          const fakeAxiosPost = sinon.fake.resolves({});
          const overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.action(actionId, async ({ respond }) => {
            await respond(responseText);
          });
          app.error(fakeErrorHandler);
          fakeReceiver.emit('message', { // IncomingEventType.Action (app.action)
            body: {
              type: 'block_actions',
              response_url: responseUrl,
              actions: [{
                action_id: actionId,
              }],
              channel: {},
              user: {},
              team: {},
            },
            ack: noop,
          });
          await delay();

          // Assert
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
          const overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.action(actionId, async ({ respond }) => {
            await respond(responseObject);
          });
          app.error(fakeErrorHandler);
          fakeReceiver.emit('message', { // IncomingEventType.Action (app.action)
            body: {
              type: 'block_actions',
              response_url: responseUrl,
              actions: [{
                action_id: actionId,
              }],
              channel: {},
              user: {},
              team: {},
            },
            ack: noop,
          });
          await delay();

          // Assert
          assert.equal(fakeAxiosPost.callCount, 1);
          // Assert that each call to fakeAxiosPost had the right arguments
          assert(fakeAxiosPost.calledWith(responseUrl, responseObject));
        });
      });

      describe('logger', () => {

        it('should be available in middleware/listener args', async () => {
          // Arrange
          const App = await importApp(overrides); // tslint:disable-line:variable-name
          const fakeLogger = createFakeLogger();
          const app = new App({
            logger: fakeLogger,
            receiver: fakeReceiver,
            authorize: sinon.fake.resolves(dummyAuthorizationResult),
          });
          app.use(({ logger, body }) => {
            logger.info(body);
          });

          app.event('app_home_opened', ({ logger, event }) => {
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
          receiverEvents.forEach(event => fakeReceiver.emit('message', event));
          await delay();

          // Assert
          assert.isTrue(fakeLogger.info.called);
          assert.isTrue(fakeLogger.debug.called);
        });
      });

      describe('client', () => {

        it('should be available in middleware/listener args', async () => {
          // Arrange
          const App = await importApp(mergeOverrides( // tslint:disable-line:variable-name
            withNoopAppMetadata(),
            withSuccessfulBotUserFetchingWebClient('B123', 'U123'),
          ));
          const tokens = [
            'xoxb-123',
            'xoxp-456',
            'xoxb-123',
          ];
          const app = new App({
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
          app.use(async ({ client }) => {
            await client.auth.test();
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
          receiverEvents.forEach(event => fakeReceiver.emit('message', event));
          await delay();

          // Assert
          assert.isUndefined(app.client.token);

          assert.equal(clients[0].token, 'xoxb-123');
          assert.equal(clients[1].token, 'xoxp-456');
          assert.equal(clients[2].token, 'xoxb-123');

          assert.notEqual(clients[0], clients[1]);
          assert.strictEqual(clients[0], clients[2]);
        });
      });

      describe('say()', () => {

        function createChannelContextualReceiverEvents(channelId: string): ReceiverEvent[] {
          return [
            // IncomingEventType.Event with channel in payload
            {
              body: {
                event: {
                  channel: channelId,
                },
                team_id: 'TEAM_ID',
              },
              ack: noop,
            },
            // IncomingEventType.Event with channel in item
            {
              body: {
                event: {
                  item: {
                    channel: channelId,
                  },
                },
                team_id: 'TEAM_ID',
              },
              ack: noop,
            },
            // IncomingEventType.Command
            {
              body: {
                command: '/COMMAND_NAME',
                channel_id: channelId,
                team_id: 'TEAM_ID',
              },
              ack: noop,
            },
            // IncomingEventType.Action from block action, interactive message, or message action
            {
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
              ack: noop,
            },
            // IncomingEventType.Action from dialog submission
            {
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
              ack: noop,
            },
          ];
        }

        it('should send a simple message to a channel where the incoming event originates', async () => {
          // Arrange
          const fakePostMessage = sinon.fake.resolves({});
          const overrides = buildOverrides([withPostMessage(fakePostMessage)]);
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          const dummyMessage = 'test';
          const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.use(async (args) => {
            // By definition, these events should all produce a say function, so we cast args.say into a SayFn
            const say = (args as any).say as SayFn;
            await say(dummyMessage);
          });
          app.error(fakeErrorHandler);
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

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
          const overrides = buildOverrides([withPostMessage(fakePostMessage)]);
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          const dummyMessage = { text: 'test' };
          const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.use(async (args) => {
            // By definition, these events should all produce a say function, so we cast args.say into a SayFn
            const say = (args as any).say as SayFn;
            await say(dummyMessage);
          });
          app.error(fakeErrorHandler);
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

          // Assert
          assert.equal(fakePostMessage.callCount, dummyReceiverEvents.length);
          // Assert that each call to fakePostMessage had the right arguments
          fakePostMessage.getCalls().forEach((call) => {
            const firstArg = call.args[0];
            assert.propertyVal(firstArg, 'channel', dummyChannelId);
            for (const prop in dummyMessage) {
              assert.propertyVal(firstArg, prop, (dummyMessage as any)[prop]);
            }
          });
          assert(fakeErrorHandler.notCalled);
        });

        function createReceiverEventsWithoutSay(channelId: string): ReceiverEvent[] {
          return [
            // IncomingEventType.Options from block action
            {
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
              ack: noop,
            },
            // IncomingEventType.Options from interactive message or dialog
            {
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
              ack: noop,
            },
            // IncomingEventType.Event without a channel context
            {
              body: {
                event: {
                },
                team_id: 'TEAM_ID',
              },
              ack: noop,
            },
          ];
        }

        it('should not exist in the arguments on incoming events that don\'t support say', async () => {
          // Arrange
          const overrides = buildOverrides([withNoopWebClient()]);
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          const assertionAggregator = sinon.fake();
          const dummyReceiverEvents = createReceiverEventsWithoutSay(dummyChannelId);

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.use((args) => {
            assert.isUndefined((args as any).say);
            // If the above assertion fails, then it would throw an AssertionError and the following line will not be
            // called
            assertionAggregator();
          });
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

          // Assert
          assert.equal(assertionAggregator.callCount, dummyReceiverEvents.length);
        });
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
      WebClient: class { },
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
        constructor(token?: string, _options?: WebClientOptions) {
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

// Fakes
type FakeReceiver = SinonSpy & EventEmitter & {
  start: SinonSpy<Parameters<Receiver['start']>, ReturnType<Receiver['start']>>;
  stop: SinonSpy<Parameters<Receiver['stop']>, ReturnType<Receiver['stop']>>;
};

function createFakeReceiver(
  startSpy: SinonSpy = sinon.fake.resolves(undefined),
  stopSpy: SinonSpy = sinon.fake.resolves(undefined),
): FakeReceiver {
  const mock = new EventEmitter();
  (mock as FakeReceiver).start = startSpy;
  (mock as FakeReceiver).stop = stopSpy;
  return mock as FakeReceiver;
}

// Dummies (values that have no real behavior but pass through the system opaquely)
function createDummyReceiverEvent(): ReceiverEvent {
  // NOTE: this is a degenerate ReceiverEvent that would successfully pass through the App. it happens to look like a
  // IncomingEventType.Event
  return {
    body: {
      event: {
      },
    },
    ack: noop,
  };
}

// Utility functions
const noop = (() => Promise.resolve(undefined));
const noopMiddleware = ({ next }: { next: NextMiddleware; }) => { next(); };
const noopAuthorize = (() => Promise.resolve({}));

// TODO: swap out rewiremock for proxyquire to see if it saves execution time
