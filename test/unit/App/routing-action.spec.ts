import sinon, { type SinonSpy } from 'sinon';
import {
  FakeReceiver,
  type Override,
  createFakeLogger,
  createDummyBlockActionEventMiddlewareArgs,
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

describe('App action() routing', () => {
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

  it('should route a block action event to a handler registered with `action(string)` that matches the action ID', async () => {
    app.action('my_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs({ action_id: 'my_id' }),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a block action event to a handler registered with `action(RegExp)` that matches the action ID', async () => {
    app.action(/my_action/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs({ action_id: 'my_action' }),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a block action event to a handler registered with `action({block_id})` that matches the block ID', async () => {
    app.action({ block_id: 'my_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs({ block_id: 'my_id' }),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a block action event to a handler registered with `action({type:block_actions})`', async () => {
    app.action({ type: 'block_actions' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs(),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should throw if provided a constraint with unknown action constraint keys', async () => {
    // @ts-ignore providing known invalid action constraint parameter
    app.action({ id: 'boom' }, fakeHandler);
    sinon.assert.calledWithMatch(fakeLogger.error, 'unknown constraint keys');
  });
});
