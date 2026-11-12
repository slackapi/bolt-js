import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../../src/App';
import {
  createDummyMemberChannelEventMiddlewareArgs,
  createDummyMessageEventMiddlewareArgs,
  createDummyReactionAddedEventMiddlewareArgs,
  createFakeLogger,
  FakeReceiver,
  importApp,
  type MockFn,
  mergeOverrides,
  noopMiddleware,
  type Override,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../../helpers';

function buildOverrides(secondOverrides: Override[]): Override {
  return mergeOverrides(
    withNoopAppMetadata(),
    withNoopWebClient(),
    ...secondOverrides,
    withMemoryStore(mock.fn()),
    withConversationContext(mock.fn(() => noopMiddleware)),
  );
}

describe('App ignore self middleware processing', () => {
  const fakeLogger = createFakeLogger();
  const fakeBotUserId = 'BUSER1';

  let fakeReceiver: FakeReceiver;
  let fakeHandler: MockFn;
  let fakeAck: MockFn;
  let dummyAuthorizationResult: { botToken: string; botId: string; botUserId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeLogger.error.mock.resetCalls();
    fakeReceiver = new FakeReceiver();
    fakeHandler = mock.fn();
    fakeAck = mock.fn();
    dummyAuthorizationResult = { botToken: '', botUserId: fakeBotUserId, botId: fakeBotUserId };
  });

  describe('with ignoreSelf true (default)', () => {
    beforeEach(async () => {
      MockApp = importApp(buildOverrides([]));
      app = new MockApp({
        logger: fakeLogger,
        receiver: fakeReceiver,
        authorize: mock.fn(() => Promise.resolve(dummyAuthorizationResult)),
      });
    });

    it('should ack & ignore message events identified as a bot message from the same bot ID as this app', async () => {
      app.message('yo', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyMessageEventMiddlewareArgs({
          message: {
            bot_id: fakeBotUserId,
            channel: 'C1234',
            channel_type: 'channel',
            event_ts: '1234.56',
            text: 'yo',
            type: 'message',
            ts: '1234.56',
            subtype: 'bot_message',
          },
        }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeAck.mock.callCount(), 1);
      assert.strictEqual(fakeHandler.mock.callCount(), 0);
    });

    it('should ack & ignore events that match own app', async () => {
      app.event('reaction_added', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyReactionAddedEventMiddlewareArgs({ user: fakeBotUserId }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeAck.mock.callCount(), 1);
      assert.strictEqual(fakeHandler.mock.callCount(), 0);
    });

    it('should not filter `member_joined_channel` and `member_left_channel` events originating from own app', async () => {
      const eventsWhichShouldNotBeFilteredOut = ['member_joined_channel', 'member_left_channel'] as const;

      for (const event of eventsWhichShouldNotBeFilteredOut) {
        app.event(event, fakeHandler);
        await fakeReceiver.sendEvent({
          ...createDummyMemberChannelEventMiddlewareArgs({ type: event, user: fakeBotUserId }),
          ack: fakeAck,
        });
      }

      assert.strictEqual(fakeAck.mock.callCount(), 2);
      assert.strictEqual(fakeHandler.mock.callCount(), 2);
    });
  });

  describe('with ignoreSelf false', () => {
    beforeEach(async () => {
      MockApp = importApp(buildOverrides([]));
      app = new MockApp({
        logger: fakeLogger,
        receiver: fakeReceiver,
        authorize: mock.fn(() => Promise.resolve(dummyAuthorizationResult)),
        ignoreSelf: false,
      });
    });

    it('should ack & route message events identified as a bot message from the same bot ID as this app to the handler', async () => {
      app.message('yo', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyMessageEventMiddlewareArgs({
          message: {
            bot_id: fakeBotUserId,
            channel: 'C1234',
            channel_type: 'channel',
            event_ts: '1234.56',
            text: 'yo',
            type: 'message',
            ts: '1234.56',
            subtype: 'bot_message',
          },
        }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeAck.mock.callCount(), 1);
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
    });

    it('should ack & route events that match own app', async () => {
      app.event('reaction_added', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyReactionAddedEventMiddlewareArgs({ user: fakeBotUserId }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeAck.mock.callCount(), 1);
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
    });
  });
});
