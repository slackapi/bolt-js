import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import {
  FakeReceiver,
  type Override,
  createDummyViewClosedMiddlewareArgs,
  createDummyViewSubmissionMiddlewareArgs,
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

describe('App view() routing', () => {
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

  it('should throw if provided a constraint with unknown view constraint keys', async () => {
    // @ts-ignore providing known invalid view constraint parameter
    app.view({ id: 'boom' }, fakeHandler);
    sinon.assert.calledWithMatch(fakeLogger.error, 'unknown constraint keys');
  });

  describe('for view submission events', () => {
    it('should route a view submission event to a handler registered with `view(string)` that matches the callback ID', async () => {
      app.view('my_id', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });

    it('should route a view submission event to a handler registered with `view(RegExp)` that matches the callback ID', async () => {
      app.view(/my_action/, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_action' }),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });

    it('should route a view submission event to a handler registered with `view({callback_id})` that matches callback ID', async () => {
      app.view({ callback_id: 'my_id' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });

    it('should route a view submission event to a handler registered with `view({type:view_submission})`', async () => {
      app.view({ type: 'view_submission' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs(),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });

    it('should route a view submission event to the corresponding handler and only acknowledge in the handler', async () => {
      fakeHandler = sinon.spy(async ({ ack }) => {
        await ack();
      });
      app.view('my_id', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.calledOnce(fakeAck);
    });

    it('should not execute handler if no routing found', async () => {
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
        ack: fakeAck,
      });
      sinon.assert.notCalled(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });
  });

  describe('for view closed events', () => {
    it('should route a view closed event to a handler registered with `view({callback_id, type:view_closed})` that matches callback ID', async () => {
      app.view({ callback_id: 'my_id', type: 'view_closed' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs({ callback_id: 'my_id', type: 'view_closed' }),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });

    it('should route a view closed event to a handler registered with `view({type:view_closed})`', async () => {
      app.view({ type: 'view_closed' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs(),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });

    it('should route a view closed event to the corresponding handler and only acknowledge in the handler', async () => {
      fakeHandler = sinon.spy(async ({ ack }) => {
        await ack();
      });
      app.view({ callback_id: 'my_id', type: 'view_closed' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs({ callback_id: 'my_id', type: 'view_closed' }),
        ack: fakeAck,
      });
      sinon.assert.calledOnce(fakeHandler);
      sinon.assert.calledOnce(fakeAck);
    });

    it('should not execute handler if no routing found', async () => {
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs({ callback_id: 'my_id', type: 'view_closed' }),
        ack: fakeAck,
      });
      sinon.assert.notCalled(fakeHandler);
      sinon.assert.notCalled(fakeAck);
    });
  });
});
