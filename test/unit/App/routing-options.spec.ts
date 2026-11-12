import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../src/App';
import {
  createDummyBlockSuggestionsMiddlewareArgs,
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

describe('App options() routing', () => {
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

  it('should route a block suggestion event to a handler registered with `options(string)` that matches the action ID', async () => {
    app.options('my_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_id' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });
  it('should route a block suggestion event to a handler registered with `options(RegExp)` that matches the action ID', async () => {
    app.options(/my_action/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_action' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });
  it('should route a block suggestion event to a handler registered with `options({block_id})` that matches the block ID', async () => {
    app.options({ block_id: 'my_id' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ block_id: 'my_id' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });
  it('should route a block suggestion event to a handler registered with `options({type:block_suggestion})`', async () => {
    app.options({ type: 'block_suggestion' }, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs(),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });

  it('should route block suggestion event to the corresponding handler and only acknowledge in the handler', async () => {
    fakeHandler = mock.fn(async ({ ack }) => {
      await ack();
    });
    app.options('my_id', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_id' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });

  it('should not execute handler if no routing found', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyBlockSuggestionsMiddlewareArgs({ action_id: 'my_id' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 0);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });
});
