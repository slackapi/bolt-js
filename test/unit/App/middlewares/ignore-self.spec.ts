import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyMemberChannelEventMiddlewareArgs,
  createDummyMessageEventMiddlewareArgs,
  createDummyReactionAddedEventMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noopMiddleware,
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
    withMemoryStore(sinon.fake()),
    withConversationContext(sinon.fake.returns(noopMiddleware)),
  );
}

describe('App ignore self middleware processing', () => {
  const fakeLogger = createFakeLogger();
  const fakeBotUserId = 'BUSER1';

  let fakeReceiver: FakeReceiver;
  let fakeHandler: SinonSpy;
  let fakeAck: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string; botUserId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeLogger.error.reset();
    fakeReceiver = new FakeReceiver();
    fakeHandler = sinon.fake();
    fakeAck = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botUserId: fakeBotUserId, botId: fakeBotUserId };
  });

  describe('with ignoreSelf true (default)', () => {
    beforeEach(async () => {
      MockApp = await importApp(buildOverrides([]));
      app = new MockApp({
        logger: fakeLogger,
        receiver: fakeReceiver,
        authorize: sinon.fake.resolves(dummyAuthorizationResult),
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
      sinon.assert.calledOnce(fakeAck);
      sinon.assert.notCalled(fakeHandler);
    });

    it('should ack & ignore events that match own app', async () => {
      app.event('reaction_added', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyReactionAddedEventMiddlewareArgs({ user: fakeBotUserId }),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeAck);
      sinon.assert.notCalled(fakeHandler);
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

      sinon.assert.callCount(fakeAck, 2);
      sinon.assert.callCount(fakeHandler, 2);
    });
  });

  describe('with ignoreSelf false', () => {
    beforeEach(async () => {
      MockApp = await importApp(buildOverrides([]));
      app = new MockApp({
        logger: fakeLogger,
        receiver: fakeReceiver,
        authorize: sinon.fake.resolves(dummyAuthorizationResult),
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
      sinon.assert.calledOnce(fakeAck);
      sinon.assert.calledOnce(fakeHandler);
    });

    it('should ack & route events that match own app', async () => {
      app.event('reaction_added', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyReactionAddedEventMiddlewareArgs({ user: fakeBotUserId }),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeAck);
      sinon.assert.calledOnce(fakeHandler);
    });
  });
});
