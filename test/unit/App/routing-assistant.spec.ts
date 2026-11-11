import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type App from '../../../src/App';
import { Assistant } from '../../../src/Assistant';
import {
  createDummyAssistantThreadContextChangedEventMiddlewareArgs,
  createDummyAssistantThreadStartedEventMiddlewareArgs,
  createDummyAssistantUserMessageEventMiddlewareArgs,
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

describe('App assistant routing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeAck: MockFn;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let MockApp: Awaited<ReturnType<typeof importApp>>;
  let app: App;
  let fakeConfig: {
    threadStarted: MockFn;
    threadContextChanged: MockFn;
    userMessage: MockFn;
  };

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeAck = mock.fn();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    MockApp = importApp(buildOverrides([]));
    app = new MockApp({
      logger: createFakeLogger(),
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve(dummyAuthorizationResult)),
    });

    fakeConfig = {
      threadStarted: mock.fn(),
      threadContextChanged: mock.fn(),
      userMessage: mock.fn(),
    };
  });

  it('should route `assistant_thread_started` event to a registered handler', async () => {
    const assistant = new Assistant(fakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadStartedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeConfig.threadStarted.mock.callCount(), 1);
    assert.strictEqual(fakeConfig.threadContextChanged.mock.callCount(), 0);
    assert.strictEqual(fakeConfig.userMessage.mock.callCount(), 0);
  });

  it('should route `assistant_thread_context_changed` event to a registered handler', async () => {
    const assistant = new Assistant(fakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadContextChangedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeConfig.threadStarted.mock.callCount(), 0);
    assert.strictEqual(fakeConfig.threadContextChanged.mock.callCount(), 1);
    assert.strictEqual(fakeConfig.userMessage.mock.callCount(), 0);
  });

  it('should route a message assistant scoped event to a registered handler', async () => {
    const assistant = new Assistant(fakeConfig);
    app.assistant(assistant);
    await fakeReceiver.sendEvent({
      ...createDummyAssistantUserMessageEventMiddlewareArgs(),
      ack: fakeAck,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeConfig.threadStarted.mock.callCount(), 0);
    assert.strictEqual(fakeConfig.threadContextChanged.mock.callCount(), 0);
    assert.strictEqual(fakeConfig.userMessage.mock.callCount(), 1);
  });

  it('should not execute handler if no routing found, but acknowledge event', async () => {
    await fakeReceiver.sendEvent({
      ...createDummyAssistantThreadStartedEventMiddlewareArgs(),
      ack: fakeAck,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeConfig.threadStarted.mock.callCount(), 0);
    assert.strictEqual(fakeConfig.threadContextChanged.mock.callCount(), 0);
    assert.strictEqual(fakeConfig.userMessage.mock.callCount(), 0);
  });
});
