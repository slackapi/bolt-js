import { assert } from 'chai';
import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import type { ViewConstraints } from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyReceiverEvent,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noop,
  noopMiddleware,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from './helpers';
import type { NextFn, ReceiverEvent } from '../../../src/types';

describe('App event routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeErrorHandler: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
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

  beforeEach(() => {
    fakeReceiver = new FakeReceiver();
    fakeErrorHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
  });

  describe('basic pattern coverage', () => {
    function createReceiverEvents(): ReceiverEvent[] {
      return [
        {
          // IncomingEventType.Event (app.event)
          ...baseEvent,
          body: {
            event: {},
          },
        },
        {
          // IncomingEventType.Command (app.command)
          ...baseEvent,
          body: {
            command: '/COMMAND_NAME',
            is_enterprise_install: 'false',
          },
        },
        {
          // IncomingEventType.Action (app.action)
          ...baseEvent,
          body: {
            type: 'block_actions',
            actions: [
              {
                action_id: 'block_action_id',
              },
            ],
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'message_action',
            callback_id: 'message_action_callback_id',
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'message_action',
            callback_id: 'another_message_action_callback_id',
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'shortcut',
            callback_id: 'shortcut_callback_id',
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'shortcut',
            callback_id: 'another_shortcut_callback_id',
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.Action (app.action)
          ...baseEvent,
          body: {
            type: 'interactive_message',
            callback_id: 'interactive_message_callback_id',
            actions: [{}],
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.Action with dialog submission (app.action)
          ...baseEvent,
          body: {
            type: 'dialog_submission',
            callback_id: 'dialog_submission_callback_id',
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.Action for an external_select block (app.options)
          ...baseEvent,
          body: {
            type: 'block_suggestion',
            action_id: 'external_select_action_id',
            channel: {},
            user: {},
            team: {},
            actions: [],
          },
        },
        {
          // IncomingEventType.Action for "data_source": "external" in dialogs (app.options)
          ...baseEvent,
          body: {
            type: 'dialog_suggestion',
            callback_id: 'dialog_suggestion_callback_id',
            name: 'the name',
            channel: {},
            user: {},
            team: {},
          },
        },
        {
          // IncomingEventType.ViewSubmitAction (app.view)
          ...baseEvent,
          body: {
            type: 'view_submission',
            channel: {},
            user: {},
            team: {},
            view: {
              callback_id: 'view_callback_id',
            },
          },
        },
        {
          ...baseEvent,
          body: {
            type: 'view_submission',
            channel: {},
            user: {},
            team: null,
            enterprise: {},
            view: {
              callback_id: 'view_callback_id',
            },
          },
        },
        {
          ...baseEvent,
          body: {
            type: 'view_submission',
            channel: {},
            user: {},
            enterprise: {},
            // Although {team: undefined} pattern does not exist as of Jan 2021,
            // this test verifies if App works even if the field is missing.
            view: {
              callback_id: 'view_callback_id',
            },
          },
        },
        {
          ...baseEvent,
          body: {
            type: 'view_submission',
            channel: {},
            user: {},
            team: {},
            // Although {enterprise: undefined} pattern does not exist as of Jan 2021,
            // this test verifies if App works even if the field is missing.
            view: {
              callback_id: 'view_callback_id',
            },
          },
        },
        {
          ...baseEvent,
          body: {
            type: 'view_closed',
            channel: {},
            user: {},
            team: {},
            view: {
              callback_id: 'view_callback_id',
            },
          },
        },
        {
          ...baseEvent,
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
        },
      ];
    }

    function createOrgAppReceiverEvents(): ReceiverEvent[] {
      return [
        {
          // IncomingEventType.Event (app.event)
          ...baseEvent,
          body: {
            event: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Command (app.command)
          ...baseEvent,
          body: {
            command: '/COMMAND_NAME',
            is_enterprise_install: 'true',
            enterprise_id: 'E12345678',
          },
        },
        {
          // IncomingEventType.Action (app.action)
          ...baseEvent,
          body: {
            type: 'block_actions',
            actions: [
              {
                action_id: 'block_action_id',
              },
            ],
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'message_action',
            callback_id: 'message_action_callback_id',
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'message_action',
            callback_id: 'another_message_action_callback_id',
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'shortcut',
            callback_id: 'shortcut_callback_id',
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Shortcut (app.shortcut)
          ...baseEvent,
          body: {
            type: 'shortcut',
            callback_id: 'another_shortcut_callback_id',
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Action (app.action)
          ...baseEvent,
          body: {
            type: 'interactive_message',
            callback_id: 'interactive_message_callback_id',
            actions: [{}],
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Action with dialog submission (app.action)
          ...baseEvent,
          body: {
            type: 'dialog_submission',
            callback_id: 'dialog_submission_callback_id',
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Action for an external_select block (app.options)
          ...baseEvent,
          body: {
            type: 'block_suggestion',
            action_id: 'external_select_action_id',
            channel: {},
            user: {},
            team: {},
            actions: [],
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.Action for "data_source": "external" in dialogs (app.options)
          ...baseEvent,
          body: {
            type: 'dialog_suggestion',
            callback_id: 'dialog_suggestion_callback_id',
            name: 'the name',
            channel: {},
            user: {},
            team: {},
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          // IncomingEventType.ViewSubmitAction (app.view)
          ...baseEvent,
          body: {
            type: 'view_submission',
            channel: {},
            user: {},
            team: {},
            view: {
              callback_id: 'view_callback_id',
            },
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          ...baseEvent,
          body: {
            type: 'view_closed',
            channel: {},
            user: {},
            team: {},
            view: {
              callback_id: 'view_callback_id',
            },
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
        {
          ...baseEvent,
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
            is_enterprise_install: true,
            enterprise: {
              id: 'E12345678',
            },
          },
        },
      ];
    }

    it('should acknowledge any of possible events', async () => {
      // Arrange
      const optionsFn = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient()]);
      const MockApp = await importApp(overrides);
      const dummyReceiverEvents = createReceiverEvents();

      // Act
      const fakeLogger = createFakeLogger();
      const app = new MockApp({
        logger: fakeLogger,
        receiver: fakeReceiver,
        authorize: sinon.fake.resolves(dummyAuthorizationResult),
      });

      app.options('external_select_action_id', async () => {
        await optionsFn();
      });
      app.options(
        {
          type: 'block_suggestion',
          action_id: 'external_select_action_id',
        },
        async () => {
          await optionsFn();
        },
      );
      app.options({ callback_id: 'dialog_suggestion_callback_id' }, async () => {
        await optionsFn();
      });
      app.options(
        {
          type: 'dialog_suggestion',
          callback_id: 'dialog_suggestion_callback_id',
        },
        async () => {
          await optionsFn();
        },
      );

      app.message('hello', noop);
      app.command('/echo', noop);
      app.command(/\/e.*/, noop);
      await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

      // Assert
      assert.equal(optionsFn.callCount, 4);
    });

    // This test confirms authorize is being used for org events
    it('should acknowledge any possible org events', async () => {
      // Arrange
      const ackFn = sinon.fake.resolves({});
      const actionFn = sinon.fake.resolves({});
      const shortcutFn = sinon.fake.resolves({});
      const viewFn = sinon.fake.resolves({});
      const optionsFn = sinon.fake.resolves({});
      overrides = buildOverrides([withNoopWebClient()]);
      const MockApp = await importApp(overrides);
      const dummyReceiverEvents = createOrgAppReceiverEvents();

      // Act
      const fakeLogger = createFakeLogger();
      const app = new MockApp({
        logger: fakeLogger,
        receiver: fakeReceiver,
        authorize: sinon.fake.resolves(dummyAuthorizationResult),
      });

      app.use(async ({ next }) => {
        await ackFn();
        await next();
      });
      app.shortcut({ callback_id: 'message_action_callback_id' }, async () => {
        await shortcutFn();
      });
      app.shortcut({ type: 'message_action', callback_id: 'another_message_action_callback_id' }, async () => {
        await shortcutFn();
      });
      app.shortcut({ type: 'message_action', callback_id: 'does_not_exist' }, async () => {
        await shortcutFn();
      });
      app.shortcut({ callback_id: 'shortcut_callback_id' }, async () => {
        await shortcutFn();
      });
      app.shortcut({ type: 'shortcut', callback_id: 'another_shortcut_callback_id' }, async () => {
        await shortcutFn();
      });
      app.shortcut({ type: 'shortcut', callback_id: 'does_not_exist' }, async () => {
        await shortcutFn();
      });
      app.action('block_action_id', async () => {
        await actionFn();
      });
      app.action({ callback_id: 'interactive_message_callback_id' }, async () => {
        await actionFn();
      });
      app.action({ callback_id: 'dialog_submission_callback_id' }, async () => {
        await actionFn();
      });
      app.view('view_callback_id', async () => {
        await viewFn();
      });
      app.view({ callback_id: 'view_callback_id', type: 'view_closed' }, async () => {
        await viewFn();
      });
      app.options('external_select_action_id', async () => {
        await optionsFn();
      });
      app.options({ callback_id: 'dialog_suggestion_callback_id' }, async () => {
        await optionsFn();
      });

      app.event('app_home_opened', noop);
      app.message('hello', noop);
      app.command('/echo', noop);

      // invalid view constraints
      const invalidViewConstraints1: ViewConstraints = {
        callback_id: 'foo',
        type: 'view_submission',
        // @ts-ignore known invalid key for ViewConstraints
        unknown_key: 'should be detected',
      };
      app.view(invalidViewConstraints1, noop);
      assert.isTrue(fakeLogger.error.called);

      fakeLogger.error.reset();

      const invalidViewConstraints2: ViewConstraints = {
        callback_id: 'foo',
        type: undefined,
        // @ts-ignore known invalid key for ViewConstraints
        unknown_key: 'should be detected',
      };
      app.view(invalidViewConstraints2, noop);
      assert.isTrue(fakeLogger.error.called);

      app.error(fakeErrorHandler);
      await Promise.all(dummyReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

      // Assert
      assert.equal(actionFn.callCount, 3);
      assert.equal(shortcutFn.callCount, 4);
      assert.equal(viewFn.callCount, 2);
      assert.equal(optionsFn.callCount, 2);
      assert.equal(ackFn.callCount, dummyReceiverEvents.length);
      assert(fakeErrorHandler.notCalled);
    });
  });

  describe('App#command patterns', () => {
    it('should respond to exact name matches', async () => {
      // Arrange
      overrides = buildOverrides([withNoopWebClient()]);
      const MockApp = await importApp(overrides);
      let matchCount = 0;

      // Act
      const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      app.command('/hello', async () => {
        matchCount += 1;
      });
      await fakeReceiver.sendEvent({
        body: {
          type: 'slash_command',
          command: '/hello',
        },
        ack: noop,
      });

      // Assert
      assert.equal(matchCount, 1);
    });

    it('should respond to pattern matches', async () => {
      // Arrange
      overrides = buildOverrides([withNoopWebClient()]);
      const MockApp = await importApp(overrides);
      let matchCount = 0;

      // Act
      const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      app.command(/h.*/, async () => {
        matchCount += 1;
      });
      await fakeReceiver.sendEvent({
        body: {
          type: 'slash_command',
          command: '/hello',
        },
        ack: noop,
      });

      // Assert
      assert.equal(matchCount, 1);
    });

    it('should run all matching listeners', async () => {
      // Arrange
      overrides = buildOverrides([withNoopWebClient()]);
      const MockApp = await importApp(overrides);
      let firstCount = 0;
      let secondCount = 0;

      // Act
      const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      app.command(/h.*/, async () => {
        firstCount += 1;
      });
      app.command(/he.*/, async () => {
        secondCount += 1;
      });
      await fakeReceiver.sendEvent({
        body: {
          type: 'slash_command',
          command: '/hello',
        },
        ack: noop,
      });

      // Assert
      assert.equal(firstCount, 1);
      assert.equal(secondCount, 1);
    });

    it('should not stop at an unsuccessful match', async () => {
      // Arrange
      overrides = buildOverrides([withNoopWebClient()]);
      const MockApp = await importApp(overrides);
      let firstCount = 0;
      let secondCount = 0;

      // Act
      const app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      app.command(/x.*/, async () => {
        firstCount += 1;
      });
      app.command(/h.*/, async () => {
        secondCount += 1;
      });
      await fakeReceiver.sendEvent({
        body: {
          type: 'slash_command',
          command: '/hello',
        },
        ack: noop,
      });

      // Assert
      assert.equal(firstCount, 0);
      assert.equal(secondCount, 1);
    });
  });

  describe('App#message patterns', () => {
    // biome-ignore lint/suspicious/noExplicitAny: spy arguments and return types don't matter in this test
    let fakeMiddleware1: sinon.SinonSpy<any[], any>;
    // biome-ignore lint/suspicious/noExplicitAny: spy arguments and return types don't matter in this test
    let fakeMiddleware2: sinon.SinonSpy<any[], any>;
    // biome-ignore lint/suspicious/noExplicitAny: spy arguments and return types don't matter in this test
    let fakeMiddlewares: sinon.SinonSpy<any[], any>[];
    // biome-ignore lint/suspicious/noExplicitAny: spy arguments and return types don't matter in this test
    let passFilter: sinon.SinonSpy<any[], any>;
    // biome-ignore lint/suspicious/noExplicitAny: spy arguments and return types don't matter in this test
    let failFilter: sinon.SinonSpy<any[], any>;
    let MockApp: typeof import('./App').default;
    let app: App;

    const callNextMiddleware =
      () =>
        async ({ next }: { next?: NextFn }) => {
          if (next) {
            await next();
          }
        };

    const fakeMessageEvent = (receiver: FakeReceiver, message: string): Promise<void> =>
      receiver.sendEvent({
        body: {
          type: 'event_callback',
          event: {
            type: 'message',
            text: message,
          },
        },
        ack: noop,
      });

    const controlledMiddleware =
      (shouldCallNext: boolean) =>
        async ({ next }: { next?: NextFn }) => {
          if (next && shouldCallNext) {
            await next();
          }
        };

    const assertMiddlewaresCalledOnce = () => {
      assert(fakeMiddleware1.calledOnce);
      assert(fakeMiddleware2.calledOnce);
    };

    const assertMiddlewaresCalledOrder = () => {
      sinon.assert.callOrder(...fakeMiddlewares);
    };

    const assertMiddlewaresNotCalled = () => {
      assert(fakeMiddleware1.notCalled);
      assert(fakeMiddleware2.notCalled);
    };

    const message = 'val - pass-string - val';
    const PASS_STRING = 'pass-string';
    const PASS_PATTERN = /.*pass-string.*/;
    const FAIL_STRING = 'fail-string';
    const FAIL_PATTERN = /.*fail-string.*/;

    beforeEach(async () => {
      sinon.restore();
      MockApp = await importApp();
      app = new MockApp({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
      fakeMiddleware1 = sinon.spy(callNextMiddleware());
      fakeMiddleware2 = sinon.spy(callNextMiddleware());
      fakeMiddlewares = [fakeMiddleware1, fakeMiddleware2];

      passFilter = sinon.spy(controlledMiddleware(true));
      failFilter = sinon.spy(controlledMiddleware(false));
    });

    //  public message(...listeners: MessageEventMiddleware[]): void;
    it('overload1 - should accept list of listeners and call each one', async () => {
      // Act
      app.message(...fakeMiddlewares);
      await fakeMessageEvent(fakeReceiver, 'testing message');

      // Assert
      assertMiddlewaresCalledOnce();
    });

    it('overload1 - should not call second listener if first does not pass', async () => {
      // Act
      app.message(controlledMiddleware(false), fakeMiddleware1);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assert(fakeMiddleware1.notCalled);
    });

    // public message(pattern: string | RegExp, ...listeners: MessageEventMiddleware[]): void;
    it('overload2 - should call listeners if message contains string', async () => {
      // Act
      app.message(PASS_STRING, ...fakeMiddlewares);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresCalledOnce();
      assertMiddlewaresCalledOrder();
    });

    it('overload2 - should not call listeners if message does not contain string', async () => {
      // Act
      app.message(FAIL_STRING, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresNotCalled();
    });

    it('overload2 - should call listeners if message matches pattern', async () => {
      // Act
      app.message(PASS_PATTERN, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresCalledOnce();
      assertMiddlewaresCalledOrder();
    });

    it('overload2 - should not call listeners if message does not match pattern', async () => {
      // Act
      app.message(FAIL_PATTERN, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresNotCalled();
    });

    it('overload3 - should call listeners if filter and string match', async () => {
      // Act
      app.message(passFilter, PASS_STRING, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresCalledOnce();
      assertMiddlewaresCalledOrder();
    });

    it('overload3 - should not call listeners if filter does not pass', async () => {
      // Act
      app.message(failFilter, PASS_STRING, ...fakeMiddlewares);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresNotCalled();
    });

    it('overload3 - should not call listeners if string does not match', async () => {
      // Act
      app.message(passFilter, FAIL_STRING, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresNotCalled();
    });

    it('overload3 - should not call listeners if message does not match pattern', async () => {
      // Act
      app.message(passFilter, FAIL_PATTERN, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresNotCalled();
    });

    it('overload4 - should call listeners if filter passes', async () => {
      // Act
      app.message(passFilter, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresCalledOrder();
      assertMiddlewaresCalledOnce();
    });

    it('overload4 - should not call listeners if filter fails', async () => {
      // Act
      app.message(failFilter, fakeMiddleware1, fakeMiddleware2);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresNotCalled();
    });

    it('should accept multiple strings', async () => {
      // Act
      app.message(PASS_STRING, '- val', ...fakeMiddlewares);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresCalledOnce();
      assertMiddlewaresCalledOrder();
    });

    it('should accept string and pattern', async () => {
      // Act
      app.message(PASS_STRING, PASS_PATTERN, ...fakeMiddlewares);
      await fakeMessageEvent(fakeReceiver, message);
      // Assert
      assertMiddlewaresCalledOnce();
      assertMiddlewaresCalledOrder();
    });

    it('should not call listeners after fail', async () => {
      // Act
      app.message(PASS_STRING, FAIL_PATTERN, ...fakeMiddlewares);
      app.message(FAIL_STRING, PASS_PATTERN, ...fakeMiddlewares);
      app.message(passFilter, failFilter, ...fakeMiddlewares);
      await fakeMessageEvent(fakeReceiver, message);

      // Assert
      assertMiddlewaresNotCalled();
    });
  });
});
