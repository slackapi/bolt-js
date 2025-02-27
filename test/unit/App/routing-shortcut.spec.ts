import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyMessageShortcutMiddlewareArgs,
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

describe('App shortcut() routing', () => {
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

  it('should route a Slack shortcut event to a handler registered with `shortcut(string)` that matches the callback ID', async () => {
    app.shortcut('my_callback_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut(RegExp)` that matches the callback ID', async () => {
    app.shortcut(/my_call/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut({callback_id})` that matches the callback ID', async () => {
    app.shortcut({ callback_id: 'my_callback_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut({type})` that matches the type', async () => {
    app.shortcut({ type: 'message_action' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs(),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut({type, callback_id})` that matches both the type and the callback_id', async () => {
    app.shortcut({ type: 'message_action', callback_id: 'my_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_id'),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });

  it('should throw if provided a constraint with unknown shortcut constraint keys', async () => {
    // @ts-ignore providing known invalid shortcut constraint parameter
    app.shortcut({ id: 'boom' }, fakeHandler);
    sinon.assert.calledWithMatch(fakeLogger.error, 'unknown constraint keys');
  });

  it('should route a Slack shortcut event to the corresponding handler and only acknowledge in the handler', async () => {
    fakeHandler = sinon.spy(async ({ ack }) => {
      await ack();
    });
    app.shortcut('my_callback_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.calledOnce(fakeAck);
  });

  it('should not execute handler if no routing found', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
      ack: fakeAck,
    });
    sinon.assert.notCalled(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
});
