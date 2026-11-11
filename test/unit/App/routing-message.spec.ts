import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../src/App';
import {
  createDummyMessageEventMiddlewareArgs,
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

describe('App message() routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeHandler: MockFn;
  let fakeAck: MockFn;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeHandler = mock.fn();
    fakeAck = mock.fn();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = importApp(buildOverrides([]));
    app = new MockApp({
      logger: createFakeLogger(),
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve(dummyAuthorizationResult)),
    });
  });

  it('should route a message event to a handler registered with `message(string)` if message contents match', async () => {
    app.message('yo', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageEventMiddlewareArgs({ text: 'yo' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });

  it('should route a message event to a handler registered with `message(RegExp)` if message contents match', async () => {
    app.message(/hi/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyMessageEventMiddlewareArgs({ text: 'hiya' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });

  it('should not execute handler if no routing found, but acknowledge message event', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyMessageEventMiddlewareArgs({ text: 'yo' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 0);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });
});
