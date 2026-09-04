import assert from 'node:assert';
import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  createDummyAppMentionEventMiddlewareArgs,
  createFakeLogger,
  FakeReceiver,
  importApp,
  mergeOverrides,
  noopMiddleware,
  type Override,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../helpers';

function buildOverrides(secondOverrides: Override[]): Override {
  return mergeOverrides(
    withNoopAppMetadata(),
    withNoopWebClient(),
    ...secondOverrides,
    withMemoryStore(sinon.fake()),
    withConversationContext(sinon.fake.returns(noopMiddleware)),
  );
}

describe('App authorize source (buildSource)', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: SinonSpy;
  let fakeAck: SinonSpy;
  let fakeAuthorize: SinonSpy;
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeHandler = sinon.fake();
    fakeAck = sinon.fake();
    fakeAuthorize = sinon.fake.resolves({ botToken: '', botId: '' });
    MockApp = importApp(buildOverrides([]));
    app = new MockApp({
      logger: createFakeLogger(),
      receiver: fakeReceiver,
      authorize: fakeAuthorize,
    });
  });

  it('should prefer the authorizations array user over the event user for events', async () => {
    // The event `user` is whoever triggered the event (e.g. the invitee in
    // `member_joined_channel`) and may never have installed the app; the
    // authorizations array names the installing user the event was
    // delivered for. authorize/fetchInstallation must be keyed on the
    // latter. See #2271.
    app.event('app_mention', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyAppMentionEventMiddlewareArgs(undefined, {
        authorizations: [
          {
            enterprise_id: null,
            team_id: 'T1234',
            user_id: 'U-installer',
            is_bot: false,
            is_enterprise_install: false,
          },
        ],
      }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeAuthorize);
    const source = fakeAuthorize.getCall(0).args[0];
    assert.strictEqual(source.userId, 'U-installer');
  });

  it('should fall back to the event user when no authorizations array is present', async () => {
    app.event('app_mention', fakeHandler);
    const args = createDummyAppMentionEventMiddlewareArgs({
      event: {
        type: 'app_mention',
        text: 'hi',
        user: 'U-event-user',
        channel: 'C1234',
        ts: '1234.56',
        event_ts: '1234.56',
      },
    });
    await fakeReceiver.sendEvent({
      ...args,
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeAuthorize);
    const source = fakeAuthorize.getCall(0).args[0];
    assert.strictEqual(source.userId, 'U-event-user');
  });
});
