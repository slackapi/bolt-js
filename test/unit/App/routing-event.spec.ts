import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../src/App';
import {
  createDummyAppMentionEventMiddlewareArgs,
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

describe('App event() routing', () => {
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

  it('should route a Slack event to a handler registered with `event(string)`', async () => {
    app.event('app_mention', fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyAppMentionEventMiddlewareArgs(),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });

  it('should route a Slack event to a handler registered with `event(RegExp)`', async () => {
    app.event(/app_mention/, fakeHandler);
    await fakeReceiver.sendEvent({
      ...createDummyAppMentionEventMiddlewareArgs(),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 1);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });

  it('should throw if provided invalid message subtype event names', async () => {
    app.event('app_mention', async () => {});
    app.event('message', async () => {});
    assert.throws(() => app.event('message.channels', async () => {}));
    assert.throws(() => app.event(/message\..+/, async () => {}));
  });

  it('should not execute handler if no routing found, but acknowledge event', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyAppMentionEventMiddlewareArgs(),
      ack: fakeAck,
    });
    assert.strictEqual(fakeHandler.mock.callCount(), 0);
    assert.strictEqual(fakeAck.mock.callCount(), 1);
  });
});
