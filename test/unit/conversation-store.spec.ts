import assert, { AssertionError } from 'node:assert/strict';
import path from 'node:path';
import { describe, it, type Mock, mock } from 'node:test';
import type { Logger } from '@slack/logger';
import type { WebClient } from '@slack/web-api';
import type { ConversationStore } from '../../src/conversation-store';
import type { AnyMiddlewareArgs, Context, NextFn } from '../../src/types';
import { createFakeLogger, delay, type Override, proxyquire } from './helpers';

/* Testing Harness */

type MiddlewareArgs = AnyMiddlewareArgs & {
  next: NextFn;
  context: Context;
  logger: Logger;
  client: WebClient;
};

interface DummyContext<ConversationState> {
  conversation?: ConversationState;
  updateConversation?: (c: ConversationState, expiresAt?: number) => Promise<unknown>;
}

// Loading the system under test using overrides
function importConversationStore(overrides: Override = {}): typeof import('../../src/conversation-store') {
  const absolutePath = path.resolve(__dirname, '../../src/conversation-store');
  return proxyquire(absolutePath, overrides);
}

// Composable overrides
function withGetTypeAndConversation(spy: Mock<() => unknown>): Override {
  return {
    './helpers': {
      getTypeAndConversation: spy,
    },
  };
}

// Fakes
function createFakeStore(
  getSpy: Mock<ConversationStore['get']> = mock.fn(() => Promise.resolve(undefined)),
  setSpy: Mock<ConversationStore['set']> = mock.fn(() => Promise.resolve({})),
) {
  return {
    set: setSpy,
    get: getSpy,
  };
}
describe('conversationContext middleware', () => {
  it('should forward events that have no conversation ID', async () => {
    // Arrange
    // conversationId property is omitted from return value
    const fakeGetTypeAndConversation = mock.fn(() => ({}));
    const fakeStore = createFakeStore();
    const fakeLogger = createFakeLogger();
    const fakeNext = mock.fn();
    const dummyContext: DummyContext<void> = {};
    const { conversationContext } = importConversationStore(withGetTypeAndConversation(fakeGetTypeAndConversation));
    const fakeArgs = {
      body: {},
      context: dummyContext,
      next: fakeNext,
      logger: fakeLogger,
    } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore);
    await middleware(fakeArgs);

    // Assert
    assert.ok(fakeLogger.debug.mock.callCount() > 0);
    assert.ok(fakeNext.mock.callCount() > 0);
    assert.ok(!('updateConversation' in dummyContext));
    assert.ok(!('conversation' in dummyContext));
  });

  it('should add to the context for events within a conversation that was not previously stored and pass expiresAt', async () => {
    // Arrange
    const dummyConversationState = Symbol();
    const dummyConversationId = 'CONVERSATION_ID';
    const dummyStoreSetResult = Symbol();
    const dummyExpiresAt = 1234;
    const fakeGetTypeAndConversation = mock.fn(() => ({ conversationId: dummyConversationId }));
    const fakeStore = createFakeStore(
      mock.fn(() => Promise.reject(new Error('Test conversation missing'))),
      mock.fn(() => Promise.resolve(dummyStoreSetResult)),
    );
    const fakeLogger = createFakeLogger();
    const fakeNext = mock.fn();
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = importConversationStore(withGetTypeAndConversation(fakeGetTypeAndConversation));
    const fakeArgs = {
      body: {},
      context: dummyContext,
      next: fakeNext,
      logger: fakeLogger,
    } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore);
    await middleware(fakeArgs);

    assert.ok(fakeNext.mock.callCount() > 0);
    assert.ok(!('conversation' in dummyContext));
    assert.ok(dummyContext.updateConversation !== undefined);
    assert.equal(await dummyContext.updateConversation(dummyConversationState, dummyExpiresAt), dummyStoreSetResult);
    assert.strictEqual(fakeStore.set.mock.callCount(), 1);
    assert.deepStrictEqual(fakeStore.set.mock.calls[0].arguments, [
      dummyConversationId,
      dummyConversationState,
      dummyExpiresAt,
    ]);
  });

  it('should add to the context for events within a conversation that was not previously stored', async () => {
    // Arrange
    const dummyConversationState = Symbol();
    const dummyConversationId = 'CONVERSATION_ID';
    const dummyStoreSetResult = Symbol();
    const fakeGetTypeAndConversation = mock.fn(() => ({ conversationId: dummyConversationId }));
    const fakeStore = createFakeStore(
      mock.fn(() => Promise.reject(new Error('Test conversation missing'))),
      mock.fn(() => Promise.resolve(dummyStoreSetResult)),
    );
    const fakeLogger = createFakeLogger();
    const fakeNext = mock.fn();
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = importConversationStore(withGetTypeAndConversation(fakeGetTypeAndConversation));
    const fakeArgs = {
      body: {},
      context: dummyContext,
      next: fakeNext,
      logger: fakeLogger,
    } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore);
    await middleware(fakeArgs);

    // Assert
    assert.ok(fakeNext.mock.callCount() > 0);
    assert.ok(!('conversation' in dummyContext));
    assert.ok(dummyContext.updateConversation !== undefined);
    assert.equal(await dummyContext.updateConversation(dummyConversationState), dummyStoreSetResult);
    assert.strictEqual(fakeStore.set.mock.callCount(), 1);
    assert.deepStrictEqual(fakeStore.set.mock.calls[0].arguments.slice(0, 2), [
      dummyConversationId,
      dummyConversationState,
    ]);
  });

  it('should add to the context for events within a conversation that was previously stored', async () => {
    // Arrange
    const dummyConversationState = Symbol();
    const dummyConversationId = 'CONVERSATION_ID';
    const dummyStoreSetResult = Symbol();
    const fakeGetTypeAndConversation = mock.fn(() => ({ conversationId: dummyConversationId }));
    const fakeStore = createFakeStore(
      mock.fn(() => Promise.resolve(dummyConversationState)),
      mock.fn(() => Promise.resolve(dummyStoreSetResult)),
    );
    const fakeLogger = createFakeLogger();
    const fakeNext = mock.fn();
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = importConversationStore(withGetTypeAndConversation(fakeGetTypeAndConversation));
    const fakeArgs = {
      body: {},
      context: dummyContext,
      next: fakeNext,
      logger: fakeLogger,
    } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore);
    await middleware(fakeArgs);

    // Assert
    assert.equal(dummyContext.conversation, dummyConversationState);
    assert.ok(dummyContext.updateConversation !== undefined);
    const newDummyConversationState = Symbol();
    const result = await dummyContext.updateConversation(newDummyConversationState);
    assert.equal(result, dummyStoreSetResult);
    assert.strictEqual(fakeStore.set.mock.callCount(), 1);
    assert.deepStrictEqual(fakeStore.set.mock.calls[0].arguments.slice(0, 2), [
      dummyConversationId,
      newDummyConversationState,
    ]);
  });
});

describe('MemoryStore', () => {
  describe('constructor', () => {
    it('should initialize successfully', async () => {
      // Arrange
      const { MemoryStore } = importConversationStore();

      // Act
      const store = new MemoryStore();

      // Assert
      assert.ok(store);
    });
  });

  // NOTE: there's no good way to fetch the contents of the map that backs the state with an override, so instead we use
  // the public API once again. as a consequence, this is not a pure unit test of a single method, but it does verify
  // the expected behavior when looking at set and get as one unit.
  describe('#set and #get', () => {
    it('should store conversation state', async () => {
      // Arrange
      const dummyConversationState = Symbol();
      const dummyConversationId = 'CONVERSATION_ID';
      const { MemoryStore } = importConversationStore();

      // Act
      const store = new MemoryStore();
      await store.set(dummyConversationId, dummyConversationState);
      const actualConversationState = await store.get(dummyConversationId);

      // Assert
      assert.equal(actualConversationState, dummyConversationState);
    });

    it('should reject lookup of conversation state when the conversation is not stored', async () => {
      // Arrange
      const { MemoryStore } = importConversationStore();

      // Act
      const store = new MemoryStore();
      try {
        await store.get('CONVERSATION_ID');
        assert.fail();
      } catch (error) {
        // Assert
        assert.ok(error instanceof Error);
        assert.ok(!(error instanceof AssertionError));
      }
    });

    it('should reject lookup of conversation state when the conversation is expired', async () => {
      // Arrange
      const dummyConversationId = 'CONVERSATION_ID';
      const dummyConversationState = Symbol();
      const expiresInMs = 5;
      const { MemoryStore } = importConversationStore();

      // Act
      const store = new MemoryStore();
      await store.set(dummyConversationId, dummyConversationState, Date.now() + expiresInMs);
      await delay(expiresInMs * 2);
      try {
        await store.get(dummyConversationId);
        assert.fail();
      } catch (error) {
        // Assert
        assert.ok(error instanceof Error);
        assert.ok(!(error instanceof AssertionError));
      }
    });
  });
});
