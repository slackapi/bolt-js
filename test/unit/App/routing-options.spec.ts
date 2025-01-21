import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyBlockSuggestionsMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noopMiddleware,
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

describe('App options() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: SinonSpy;
  let fakeAck: SinonSpy;
  const fakeLogger = createFakeLogger();
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeLogger.error.reset();
    fakeReceiver = new FakeReceiver();
    fakeHandler = sinon.fake();
    fakeAck = sinon.fake();
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
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a block suggestion event to a handler registered with `options(RegExp)` that matches the action ID', async () => {
    app.options(/my_action/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_action' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a block suggestion event to a handler registered with `options({block_id})` that matches the block ID', async () => {
    app.options({ block_id: 'my_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ block_id: 'my_id' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a block suggestion event to a handler registered with `options({type:block_suggestion})`', async () => {
    app.options({ type: 'block_suggestion' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs(),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });

  it('should route block suggestion event to the corresponding handler and only acknowledge in the handler', async () => {
    fakeHandler = sinon.spy(async ({ ack }) => {
      await ack();
    });
    app.options('my_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_id' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.calledOnce(fakeAck);
  });

  it('should not execute handler if no routing found', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_id' }),
      ack: fakeAck,
    });
    sinon.assert.notCalled(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
});
