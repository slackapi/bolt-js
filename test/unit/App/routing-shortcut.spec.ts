import sinon, { type SinonSpy } from 'sinon';
import {
  FakeReceiver,
  type Override,
  createFakeLogger,
  createDummyMessageShortcutMiddlewareArgs,
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

describe('App shortcut() routing', () => {
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

  it('should route a Slack shortcut event to a handler registered with `shortcut(string)` that matches the callback ID', async () => {
    app.shortcut('my_callback_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut(RegExp)` that matches the callback ID', async () => {
    app.shortcut(/my_call/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut({callback_id})` that matches the callback ID', async () => {
    app.shortcut({ callback_id: 'my_callback_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_callback_id'),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut({type})` that matches the type', async () => {
    app.shortcut({ type: 'message_action' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs(),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a Slack shortcut event to a handler registered with `shortcut({type, callback_id})` that matches both the type and the callback_id', async () => {
    app.shortcut({ type: 'message_action', callback_id: 'my_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageShortcutMiddlewareArgs('my_id'),
    });
    sinon.assert.called(fakeHandler);
  });
  it('should throw if provided a constraint with unknown shortcut constraint keys', async () => {
    // @ts-ignore providing known invalid shortcut constraint parameter
    app.shortcut({ id: 'boom' }, fakeHandler);
    sinon.assert.calledWithMatch(fakeLogger.error, 'unknown constraint keys');
  });
});
