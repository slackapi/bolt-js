import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../src/App';
import {
  createDummyCustomFunctionMiddlewareArgs,
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

describe('App function() routing', () => {
  let fakeReceiver: FakeReceiver;
  const fakeHandler: MockFn = mock.fn();
  const fakeAck: MockFn = mock.fn(() => Promise.resolve({}));
  const fakeLogger = createFakeLogger();
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeLogger.error.mock.resetCalls();
    fakeReceiver = new FakeReceiver();
    fakeHandler.mock.resetCalls();
    fakeAck.mock.resetCalls();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = importApp(buildOverrides([]));
    app = new MockApp({
      logger: fakeLogger,
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve(dummyAuthorizationResult)),
    });
  });
  describe('for function executed events', () => {
    it('should route a function executed event to a handler registered with `function(string)` that matches the callback ID', async () => {
      app.function('my_id', fakeHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({
        callbackId: 'my_id',
        options: { autoAcknowledge: false },
      });
      await fakeReceiver.sendEvent({
        ack: fakeAck,
        body: args.body,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
    });

    it('should route a function executed event to a handler with the proper arguments', async () => {
      const testInputs = { test: true };
      const testHandler = mock.fn(async ({ inputs, complete, fail, client }) => {
        assert.equal(inputs, testInputs);
        assert.strictEqual(typeof complete, 'function');
        assert.strictEqual(typeof fail, 'function');
        assert.equal(client.token, 'xwfp-valid');
      });
      app.function('my_id', testHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({
        callbackId: 'my_id',
        inputs: testInputs,
        options: { autoAcknowledge: false },
      });
      await fakeReceiver.sendEvent({
        ack: fakeAck,
        body: args.body,
      });
      assert.strictEqual(testHandler.mock.callCount(), 1);
    });

    it('should route a function executed event to a handler and auto ack by default', async () => {
      app.function('my_id', fakeHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({ callbackId: 'my_id' });
      await fakeReceiver.sendEvent({
        ack: fakeAck,
        body: args.body,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 1);
    });

    it('should route a function executed event to a handler and NOT auto ack if autoAcknowledge is false', async () => {
      app.function('my_id', { autoAcknowledge: false }, fakeHandler);
      const args = createDummyCustomFunctionMiddlewareArgs({ callbackId: 'my_id' });
      const fakeAck: MockFn = mock.fn(() => Promise.resolve({}));
      await fakeReceiver.sendEvent({
        ack: fakeAck,
        body: args.body,
      });
      assert.strictEqual(fakeHandler.mock.callCount(), 1);
      assert.strictEqual(fakeAck.mock.callCount(), 0);
    });
  });
});
