import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyMessageEventMiddlewareArgs,
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

describe('App message() routing', () => {
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
    MockApp = importApp(buildOverrides([]));
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
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.calledOnce(fakeAck);
  });

  it('should route a message event to a handler registered with `message(RegExp)` if message contents match', async () => {
    app.message(/hi/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageEventMiddlewareArgs({ text: 'hiya' }),
      ack: fakeAck,
    });
    sinon.assert.calledOnce(fakeHandler);
    sinon.assert.calledOnce(fakeAck);
  });

  it('should not execute handler if no routing found, but acknowledge message event', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyMessageEventMiddlewareArgs({ text: 'yo' }),
      ack: fakeAck,
    });
    sinon.assert.notCalled(fakeHandler);
    sinon.assert.calledOnce(fakeAck);
  });
});
