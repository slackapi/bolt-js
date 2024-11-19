import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyBlockActionEventMiddlewareArgs,
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

describe('App action() routing', () => {
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

  it('should route a block action event to a handler registered with `action(string)` that matches the action ID', async () => {
    app.action('my_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs({ action_id: 'my_id' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a block action event to a handler registered with `action(RegExp)` that matches the action ID', async () => {
    app.action(/my_action/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs({ action_id: 'my_action' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a block action event to a handler registered with `action({block_id})` that matches the block ID', async () => {
    app.action({ block_id: 'my_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs({ block_id: 'my_id' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a block action event to a handler registered with `action({type:block_actions})`', async () => {
    app.action({ type: 'block_actions' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs(),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });

  it('should throw if provided a constraint with unknown action constraint keys', async () => {
    // @ts-ignore providing known invalid action constraint parameter
    app.action({ id: 'boom' }, fakeHandler);
    sinon.assert.calledWithMatch(fakeLogger.error, 'unknown constraint keys');
  });

  it('should route an action event to the corresponding handler and only acknowledge in the handler', async () => {
    fakeHandler = sinon.spy(async ({ ack }) => {
      await ack();
    });
    app.action('my_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs({ action_id: 'my_id' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.calledOnce(fakeAck);
  });

  it('should not execute handler if no routing found', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyBlockActionEventMiddlewareArgs(),
      ack: fakeAck,
    });
    sinon.assert.notCalled(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
});
