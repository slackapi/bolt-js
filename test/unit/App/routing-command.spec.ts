import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../src/App';
import {
  createDummyCommandMiddlewareArgs,
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

describe('App command() routing', () => {
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

  it('should route a command to a handler registered with `command(string)` if command name matches', async () => {
    app.command('/yo', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/yo' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });

  it('should route a command to a handler registered with `command(RegExp)` if comand name matches', async () => {
    app.command(/hi/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/hiya' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });

  it('should route a command to the corresponding handler and only acknowledge in the handler', async () => {
    fakeHandler = mock.fn(async ({ ack }) => {
      await ack();
    });
    app.command('/yo', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/yo' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });

  it('should not execute handler if no routing found', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyCommandMiddlewareArgs({ command: '/yo' }),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 0);
    assert.strictEqual(fakeAck.mock.callCount(), 0);
  });
});
