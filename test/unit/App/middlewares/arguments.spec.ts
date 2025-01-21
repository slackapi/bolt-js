import type { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon, { type SinonSpy } from 'sinon';
import { LogLevel } from '../../../../src/App';
import type { ReceiverEvent, SayFn } from '../../../../src/types';
import {
  FakeReceiver,
  type Override,
  createDummyAppMentionEventMiddlewareArgs,
  createDummyBlockActionEventMiddlewareArgs,
  createDummyMessageEventMiddlewareArgs,
  createDummyReceiverEvent,
  createDummyViewSubmissionMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noop,
  noopMiddleware,
  withAxiosPost,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
  withPostMessage,
  withSuccessfulBotUserFetchingWebClient,
} from '../../helpers';

describe('App middleware and listener arguments', () => {
  let fakeReceiver: FakeReceiver;
  let fakeErrorHandler: SinonSpy;
  let fakeAck: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let overrides: Override;

  const dummyChannelId = 'CHANNEL_ID';
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

  beforeEach(() => {
    fakeReceiver = new FakeReceiver();
    fakeErrorHandler = sinon.fake();
    fakeAck = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
  });

  describe('authorize', () => {
    it('should extract valid enterprise_id in a shared channel #935', async () => {
      const fakeAxiosPost = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
      const MockApp = await importApp(overrides);
      const fakeHandler = sinon.fake();

      const app = new MockApp({
        receiver: fakeReceiver,
        authorize: async ({ enterpriseId }) => {
          if (enterpriseId !== undefined) {
            throw new Error('the enterprise_id must be undefined in this scenario');
          }
          return dummyAuthorizationResult;
        },
      });
      app.event('message', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyMessageEventMiddlewareArgs(
          {},
          {
            authorizations: [
              {
                enterprise_id: null,
                team_id: 'T_this_non_grid_workspace',
                user_id: 'U_authed_user',
                is_bot: true,
                is_enterprise_install: false,
              },
            ],
          },
        ),
        ack: fakeAck,
      });

      sinon.assert.calledOnce(fakeAck);
      sinon.assert.calledOnce(fakeHandler);
    });
    it('should be skipped for tokens_revoked events #674', async () => {
      const fakeAxiosPost = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
      const MockApp = await importApp(overrides);
      const fakeAuthorize = sinon.fake.resolves({});
      const fakeHandler = sinon.fake();

      const app = new MockApp({
        receiver: fakeReceiver,
        authorize: fakeAuthorize,
      });
      app.event('tokens_revoked', fakeHandler);

      // The authorize must be called for other events
      await fakeReceiver.sendEvent({
        ...createDummyAppMentionEventMiddlewareArgs(),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeAck);
      sinon.assert.calledOnce(fakeAuthorize);

      await fakeReceiver.sendEvent({
        ack: fakeAck,
        body: {
          enterprise_id: 'E_org_id',
          api_app_id: 'A111',
          event: {
            type: 'tokens_revoked',
            tokens: {
              oauth: ['P'],
              bot: ['B'],
            },
          },
          type: 'event_callback',
        },
      });

      sinon.assert.calledTwice(fakeAck);
      sinon.assert.calledOnce(fakeAuthorize); // still 1
      sinon.assert.calledOnce(fakeHandler);
    });
    it('should be skipped for app_uninstalled events #674', async () => {
      const fakeAxiosPost = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
      const MockApp = await importApp(overrides);
      const fakeAuthorize = sinon.fake.resolves({});
      const fakeHandler = sinon.fake();

      const app = new MockApp({
        receiver: fakeReceiver,
        authorize: fakeAuthorize,
      });
      app.event('app_uninstalled', fakeHandler);

      // The authorize must be called for other events
      await fakeReceiver.sendEvent({
        ...createDummyAppMentionEventMiddlewareArgs(),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeAck);
      sinon.assert.calledOnce(fakeAuthorize);

      await fakeReceiver.sendEvent({
        ack: fakeAck,
        body: {
          enterprise_id: 'E_org_id',
          api_app_id: 'A111',
          event: {
            type: 'app_uninstalled',
          },
          type: 'event_callback',
        },
      });

      sinon.assert.calledTwice(fakeAck);
      sinon.assert.calledOnce(fakeAuthorize); // still 1
      sinon.assert.calledOnce(fakeHandler);
    });
  });

  describe('respond()', () => {
    it('should respond to events with a response_url', async () => {
      const responseText = 'response';
      const response_url = 'https://fake.slack/response_url';
      const action_id = 'block_action_id';
      const fakeAxiosPost = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
      const MockApp = await importApp(overrides);

      const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      app.action(action_id, async ({ respond }) => {
        await respond(responseText);
      });
      app.error(fakeErrorHandler);
      await fakeReceiver.sendEvent(
        createDummyBlockActionEventMiddlewareArgs(
          {
            action: {
              type: 'button',
              action_id,
              block_id: 'bid',
              action_ts: '1',
              text: { type: 'plain_text', text: 'hi' },
            },
          },
          {
            response_url,
          },
        ),
      );

      sinon.assert.notCalled(fakeErrorHandler);
      // Assert that each call to fakeAxiosPost had the right arguments
      sinon.assert.calledOnceWithExactly(fakeAxiosPost, response_url, { text: responseText });
    });

    it('should respond with a response object', async () => {
      const responseObject = { text: 'response' };
      const response_url = 'https://fake.slack/response_url';
      const action_id = 'block_action_id';
      const fakeAxiosPost = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
      const MockApp = await importApp(overrides);

      const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      app.action(action_id, async ({ respond }) => {
        await respond(responseObject);
      });
      app.error(fakeErrorHandler);
      await fakeReceiver.sendEvent(
        createDummyBlockActionEventMiddlewareArgs(
          {
            action: {
              type: 'button',
              action_id,
              block_id: 'bid',
              action_ts: '1',
              text: { type: 'plain_text', text: 'hi' },
            },
          },
          {
            response_url,
          },
        ),
      );

      // Assert that each call to fakeAxiosPost had the right arguments
      sinon.assert.calledOnceWithExactly(fakeAxiosPost, response_url, responseObject);
    });
    it('should be able to use respond for view_submission payloads', async () => {
      const responseObject = { text: 'response' };
      const responseUrl = 'https://fake.slack/response_url';
      const fakeAxiosPost = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
      const MockApp = await importApp(overrides);

      const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      app.view('view-id', async ({ respond }) => {
        await respond(responseObject);
      });
      app.error(fakeErrorHandler);
      await fakeReceiver.sendEvent(
        createDummyViewSubmissionMiddlewareArgs(
          {
            id: 'V111',
            type: 'modal',
            callback_id: 'view-id',
          },
          {
            response_urls: [
              {
                block_id: 'b',
                action_id: 'a',
                channel_id: 'C111',
                response_url: 'https://fake.slack/response_url',
              },
            ],
          },
        ),
      );

      // Assert that each call to fakeAxiosPost had the right arguments
      sinon.assert.calledOnceWithExactly(fakeAxiosPost, responseUrl, responseObject);
    });
  });

  describe('logger', () => {
    it('should be available in middleware/listener args', async () => {
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
          ack: fakeAck,
        },
      ];

      await Promise.all(receiverEvents.map((event) => fakeReceiver.sendEvent(event)));

      sinon.assert.calledOnce(fakeAck);
      sinon.assert.calledOnce(fakeLogger.info);
      sinon.assert.calledOnce(fakeLogger.debug);
    });

    it('should work in the case both logger and logLevel are given', async () => {
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
          ack: fakeAck,
        },
      ];

      await Promise.all(receiverEvents.map((event) => fakeReceiver.sendEvent(event)));

      sinon.assert.calledOnce(fakeAck);
      sinon.assert.calledOnce(fakeLogger.info);
      sinon.assert.calledOnce(fakeLogger.debug);
      sinon.assert.calledOnce(fakeLogger.setLevel);
    });
  });

  describe('client', () => {
    it('should be available in middleware/listener args', async () => {
      const MockApp = await importApp(
        mergeOverrides(withNoopAppMetadata(), withSuccessfulBotUserFetchingWebClient('B123', 'U123')),
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
        ack: fakeAck,
      };
      const receiverEvents = [event, event, event];

      await Promise.all(receiverEvents.map((evt) => fakeReceiver.sendEvent(evt)));

      sinon.assert.calledThrice(fakeAck);

      assert.isUndefined(app.client.token);
      assert.equal(clients[0].token, 'xoxb-123');
      assert.equal(clients[1].token, 'xoxp-456');
      assert.equal(clients[2].token, 'xoxb-123');
      assert.notEqual(clients[0], clients[1]);
      assert.strictEqual(clients[0], clients[2]);
    });

    it("should be set to the global app client when authorization doesn't produce a token", async () => {
      const MockApp = await importApp();
      const app = new MockApp({
        receiver: fakeReceiver,
        authorize: noop,
        ignoreSelf: false,
      });
      const globalClient = app.client;

      let clientArg: WebClient | undefined;
      app.use(async ({ client }) => {
        clientArg = client;
      });
      await fakeReceiver.sendEvent(createDummyReceiverEvent());

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
    describe('for events that should include say() utility', () => {
      it('should send a simple message to a channel where the incoming event originates', async () => {
        const fakePostMessage = sinon.fake.resolves({});
        overrides = buildOverrides([withPostMessage(fakePostMessage)]);
        const MockApp = await importApp(overrides);

        const dummyMessage = 'test';
        const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          // biome-ignore lint/suspicious/noExplicitAny: By definition, these events should all produce a say function, so we cast args.say into a SayFn
          const say = (args as any).say as SayFn;
          await say(dummyMessage);
        });
        app.error(fakeErrorHandler);
        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        sinon.assert.callCount(fakePostMessage, dummyReceiverEvents.length);
        // Assert that each call to fakePostMessage had the right arguments
        for (const call of fakePostMessage.getCalls()) {
          const firstArg = call.args[0];
          assert.propertyVal(firstArg, 'text', dummyMessage);
          assert.propertyVal(firstArg, 'channel', dummyChannelId);
        }
        sinon.assert.notCalled(fakeErrorHandler);
      });

      it('should send a complex message to a channel where the incoming event originates', async () => {
        const fakePostMessage = sinon.fake.resolves({});
        overrides = buildOverrides([withPostMessage(fakePostMessage)]);
        const MockApp = await importApp(overrides);

        const dummyMessage = { text: 'test' };
        const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          // biome-ignore lint/suspicious/noExplicitAny: By definition, these events should all produce a say function, so we cast args.say into a SayFn
          const say = (args as any).say as SayFn;
          await say(dummyMessage);
        });
        app.error(fakeErrorHandler);
        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        sinon.assert.callCount(fakePostMessage, dummyReceiverEvents.length);
        // Assert that each call to fakePostMessage had the right arguments
        for (const call of fakePostMessage.getCalls()) {
          const firstArg = call.args[0];
          assert.propertyVal(firstArg, 'channel', dummyChannelId);
          assert.propertyVal(firstArg, 'text', dummyMessage.text);
        }
        sinon.assert.notCalled(fakeErrorHandler);
      });
    });

    describe('for events that should not include say() utility', () => {
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
        overrides = buildOverrides([withNoopWebClient()]);
        const MockApp = await importApp(overrides);

        const assertionAggregator = sinon.fake();
        const dummyReceiverEvents = createReceiverEventsWithoutSay(dummyChannelId);

        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          assert.notProperty(args, 'say');
          // If the above assertion fails, then it would throw an AssertionError and the following line will not be
          // called
          assertionAggregator();
        });

        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        sinon.assert.callCount(assertionAggregator, dummyReceiverEvents.length);
      });

      it("should handle failures through the App's global error handler", async () => {
        const fakePostMessage = sinon.fake.rejects(new Error('fake error'));
        overrides = buildOverrides([withPostMessage(fakePostMessage)]);
        const MockApp = await importApp(overrides);

        const dummyMessage = { text: 'test' };
        const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);

        const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(async (args) => {
          // biome-ignore lint/suspicious/noExplicitAny: By definition, these events should all produce a say function, so we cast args.say into a SayFn
          const say = (args as any).say as SayFn;
          await say(dummyMessage);
        });
        app.error(fakeErrorHandler);
        await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

        sinon.assert.callCount(fakeErrorHandler, dummyReceiverEvents.length);
      });
    });
  });

  describe('ack()', () => {
    it('should be available in middleware/listener args', async () => {
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
          ack: fakeAck,
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
          ack: fakeAck,
        },
      ];

      await Promise.all(receiverEvents.map((event) => fakeReceiver.sendEvent(event)));

      sinon.assert.calledOnceWithExactly(fakeLogger.info, 'Events API');
      sinon.assert.calledTwice(fakeAck);
    });
  });

  describe('context', () => {
    it('should be able to use the app_installed_team_id when provided by the payload', async () => {
      const fakeAxiosPost = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
      const MockApp = await importApp(overrides);
      const callback_id = 'view-id';
      const app_installed_team_id = 'T-installed-workspace';

      const app = new MockApp({
        receiver: fakeReceiver,
        authorize: sinon.fake.resolves(dummyAuthorizationResult),
      });

      app.view(callback_id, async ({ ack, context, view }) => {
        assert.equal(context.teamId, app_installed_team_id);
        assert.notEqual(view.team_id, app_installed_team_id);
        await ack();
      });
      app.error(fakeErrorHandler);

      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({
          callback_id,
          app_installed_team_id,
        }),
        ack: fakeAck,
      });

      sinon.assert.calledOnce(fakeAck);
    });
  });
});
