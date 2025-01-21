import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyCommandMiddlewareArgs,
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

describe('App command() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: SinonSpy;
  let fakeAck: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeHandler = sinon.fake();
    fakeAck = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = await importApp(buildOverrides([]));
    app = new MockApp({
      logger: createFakeLogger(),
      receiver: fakeReceiver,
      authorize: sinon.fake.resolves(dummyAuthorizationResult),
    });
  });

  it('should route a command to a handler registered with `command(string)` if command name matches', async () => {
    app.command('/yo', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/yo' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });

  it('should route a command to a handler registered with `command(RegExp)` if comand name matches', async () => {
    app.command(/hi/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/hiya' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });

  it('should route a command to the corresponding handler and only acknowledge in the handler', async () => {
    fakeHandler = sinon.spy(async ({ ack }) => {
      await ack();
    });
    app.command('/yo', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/yo' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.calledOnce(fakeAck);
  });

  it('should not execute handler if no routing found', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/yo' }),
      ack: fakeAck,
    });
    sinon.assert.notCalled(fakeHandler);
    sinon.assert.notCalled(fakeAck);
  });
});
