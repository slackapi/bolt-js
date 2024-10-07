import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyCustomFunctionMiddlewareArgs,
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

describe('App function() routing', () => {
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
  describe('for function executed events', () => {
    it('should route a function executed event to a handler registered with `function(string)` that matches the callback ID', async () => {
      app.view('my_id', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyCustomFunctionMiddlewareArgs('my_id'),
      });
      sinon.assert.called(fakeHandler);
    });
  });
});
