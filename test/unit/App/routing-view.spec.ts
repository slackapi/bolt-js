import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../src/App';
import {
  createDummyViewClosedMiddlewareArgs,
  createDummyViewSubmissionMiddlewareArgs,
  createFakeLogger,
  FakeReceiver,
  importApp,
  type MockFn,
  mergeOverrides,
  noopMiddleware,
  type Override,
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
    withMemoryStore(mock.fn()),
    withConversationContext(mock.fn(() => noopMiddleware)),
  );
}

describe('App view() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: MockFn;
  let fakeAck: MockFn;
  const fakeLogger = createFakeLogger();
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeLogger.error.mock.resetCalls();
    fakeReceiver = new FakeReceiver();
    fakeHandler = mock.fn();
    fakeAck = mock.fn();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = importApp(buildOverrides([]));
    app = new MockApp({
      logger: fakeLogger,
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve(dummyAuthorizationResult)),
    });
  });

  it('should throw if provided a constraint with unknown view constraint keys', async () => {
    // @ts-expect-error providing known invalid view constraint parameter
    app.view({ id: 'boom' }, fakeHandler);
    assert.deepStrictEqual(
      fakeLogger.error.mock.calls.map((call) => call.arguments),
      [['View listener cannot be attached using unknown constraint keys: id']],
    );
  });

  describe('for view submission events', () => {
    it('should route a view submission event to a handler registered with `view(string)` that matches the callback ID', async () => {
      app.view('my_id', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });

    it('should route a view submission event to a handler registered with `view(RegExp)` that matches the callback ID', async () => {
      app.view(/my_action/, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_action' }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });

    it('should route a view submission event to a handler registered with `view({callback_id})` that matches callback ID', async () => {
      app.view({ callback_id: 'my_id' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });

    it('should route a view submission event to a handler registered with `view({type:view_submission})`', async () => {
      app.view({ type: 'view_submission' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs(),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });

    it('should route a view submission event to the corresponding handler and only acknowledge in the handler', async () => {
      fakeHandler = mock.fn(async ({ ack }) => {
        await ack();
      });
      app.view('my_id', fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 1);
    });

    it('should not execute handler if no routing found', async () => {
      await fakeReceiver.sendEvent({
        ...createDummyViewSubmissionMiddlewareArgs({ callback_id: 'my_id' }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 0);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });
  });

  describe('for view closed events', () => {
    it('should route a view closed event to a handler registered with `view({callback_id, type:view_closed})` that matches callback ID', async () => {
      app.view({ callback_id: 'my_id', type: 'view_closed' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs({ callback_id: 'my_id', type: 'view_closed' }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });

    it('should route a view closed event to a handler registered with `view({type:view_closed})`', async () => {
      app.view({ type: 'view_closed' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs(),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });

    it('should route a view closed event to the corresponding handler and only acknowledge in the handler', async () => {
      fakeHandler = mock.fn(async ({ ack }) => {
        await ack();
      });
      app.view({ callback_id: 'my_id', type: 'view_closed' }, fakeHandler);
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs({ callback_id: 'my_id', type: 'view_closed' }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 1);
    });

    it('should not execute handler if no routing found', async () => {
      await fakeReceiver.sendEvent({
        ...createDummyViewClosedMiddlewareArgs({ callback_id: 'my_id', type: 'view_closed' }),
        ack: fakeAck,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 0);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });
  });
});
