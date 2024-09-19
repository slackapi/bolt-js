import sinon, { type SinonSpy } from 'sinon';
import {
  FakeReceiver,
  type Override,
  createFakeLogger,
  createDummyMessageEventMiddlewareArgs,
  importApp,
  mergeOverrides,
  noopMiddleware,
  noopVoid,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../helpers';
import type App from '../../../src/App';

function buildOverrides(secondOverrides: Override[]): Override {
  return mergeOverrides(
    withNoopAppMetadata(),
    withNoopWebClient(),
    ...secondOverrides,
    withMemoryStore(sinon.fake()),
    withConversationContext(sinon.fake.returns(noopMiddleware)),
  );
}

describe('App message() routing', () => {
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

  it('should route a message event to a handler registered with `message(string)` if message contents match', async () => {
    app.message('yo', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageEventMiddlewareArgs({ text: 'yo' }),
      ack: noopVoid,
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a message event to a handler registered with `message(RegExp)` if message contents match', async () => {
    app.message(/hi/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageEventMiddlewareArgs({ text: 'hiya' }),
      ack: noopVoid,
    });
    sinon.assert.called(fakeHandler);
  });
});
