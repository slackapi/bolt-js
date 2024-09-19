import sinon, { type SinonSpy } from 'sinon';
import {
  FakeReceiver,
  type Override,
  createFakeLogger,
  createDummyBlockSuggestionsMiddlewareArgs,
  importApp,
  mergeOverrides,
  noopMiddleware,
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

describe('App options() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: SinonSpy;
  const fakeLogger = createFakeLogger();
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeLogger.error.reset();
    fakeReceiver = new FakeReceiver();
    fakeHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = await importApp(buildOverrides([]));
    app = new MockApp({
      logger: fakeLogger,
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
  });

  it('should route a block suggestion event to a handler registered with `options(string)` that matches the action ID', async () => {
    app.options('my_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_id' }),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a block suggestion event to a handler registered with `options(RegExp)` that matches the action ID', async () => {
    app.options(/my_action/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_action' }),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a block suggestion event to a handler registered with `options({block_id})` that matches the block ID', async () => {
    app.options({ block_id: 'my_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ block_id: 'my_id' }),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a block suggestion event to a handler registered with `options({type:block_suggestion})`', async () => {
    app.options({ type: 'block_suggestion' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs(),
    });
    sinon.assert.called(fakeHandler);
  });
});
