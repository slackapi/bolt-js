import assert from 'node:assert';
import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyAppMentionEventMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noopMiddleware,
  noopVoid,
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

describe('App event() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = await importApp(buildOverrides([]));
    app = new MockApp({
      logger: createFakeLogger(),
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
  });

  it('should route a Slack event to a handler registered with `event(string)`', async () => {
    app.event('app_mention', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyAppMentionEventMiddlewareArgs(),
      ack: noopVoid,
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a Slack event to a handler registered with `event(RegExp)`', async () => {
    app.event(/app_mention/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyAppMentionEventMiddlewareArgs(),
      ack: noopVoid,
    });
    sinon.assert.called(fakeHandler);
  });
  it('should throw if provided invalid message subtype event names', async () => {
    app.event('app_mention', async () => {});
    app.event('message', async () => {});
    assert.throws(() => app.event('message.channels', async () => {}));
    assert.throws(() => app.event(/message\..+/, async () => {}));
  });
});
