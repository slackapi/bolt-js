import sinon, { type SinonSpy } from 'sinon';
import {
  FakeReceiver,
  type Override,
  createFakeLogger,
  createDummyCommandMiddlewareArgs,
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

describe('App command() routing', () => {
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

  it('should route a command to a handler registered with `command(string)` if command name matches', async () => {
    app.command('/yo', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/yo' }),
      ack: noopVoid,
    });
    sinon.assert.called(fakeHandler);
  });
  it('should route a command to a handler registered with `command(RegExp)` if comand name matches', async () => {
    app.command(/hi/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/hiya' }),
      ack: noopVoid,
    });
    sinon.assert.called(fakeHandler);
  });
});
