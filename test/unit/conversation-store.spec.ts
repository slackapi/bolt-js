import type { Logger } from '@slack/logger';
import type { WebClient } from '@slack/web-api';
import { assert, AssertionError } from 'chai';
import rewiremock from 'rewiremock';
import sinon, { type SinonSpy } from 'sinon';
import type { AnyMiddlewareArgs, Context, NextFn } from '../../src/types';
import { type Override, createFakeLogger, delay } from './helpers';

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
async function importConversationStore(
  overrides: Override = {},
): Promise<typeof import('../../src/conversation-store')> {
  return rewiremock.module(() => import('../../src/conversation-store'), overrides);
}

// Composable overrides
function withGetTypeAndConversation(spy: SinonSpy): Override {
  return {
    './helpers': {
      getTypeAndConversation: spy,
    },
  };
}

// Fakes
function createFakeStore(
  getSpy: SinonSpy = sinon.fake.resolves(undefined),
  setSpy: SinonSpy = sinon.fake.resolves({}),
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
    const fakeGetTypeAndConversation = sinon.fake.returns({});
    const fakeStore = createFakeStore();
    const fakeLogger = createFakeLogger();
    const fakeNext = sinon.fake();
    const dummyContext: DummyContext<void> = {};
    const { conversationContext } = await importConversationStore(
      withGetTypeAndConversation(fakeGetTypeAndConversation),
    );
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
    assert(fakeLogger.debug.called);
    assert(fakeNext.called);
    assert.notProperty(dummyContext, 'updateConversation');
    assert.notProperty(dummyContext, 'conversation');
  });

  it('should add to the context for events within a conversation that was not previously stored and pass expiresAt', async () => {
    // Arrange
    const dummyConversationState = Symbol();
    const dummyConversationId = 'CONVERSATION_ID';
    const dummyStoreSetResult = Symbol();
    const dummyExpiresAt = 1234;
    const fakeGetTypeAndConversation = sinon.fake.returns({ conversationId: dummyConversationId });
    const fakeStore = createFakeStore(
      sinon.fake.rejects(new Error('Test conversation missing')),
      sinon.fake.resolves(dummyStoreSetResult),
    );
    const fakeLogger = createFakeLogger();
    const fakeNext = sinon.fake();
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = await importConversationStore(
      withGetTypeAndConversation(fakeGetTypeAndConversation),
    );
    const fakeArgs = {
      body: {},
      context: dummyContext,
      next: fakeNext,
      logger: fakeLogger,
    } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore);
    await middleware(fakeArgs);

    assert(fakeNext.called);
    assert.notProperty(dummyContext, 'conversation');
    if (dummyContext.updateConversation === undefined) {
      assert.fail();
    }
    assert.equal(await dummyContext.updateConversation(dummyConversationState, dummyExpiresAt), dummyStoreSetResult);
    assert(fakeStore.set.calledOnce);
    assert(fakeStore.set.calledWith(dummyConversationId, dummyConversationState, dummyExpiresAt));
  });

  it('should add to the context for events within a conversation that was not previously stored', async () => {
    // Arrange
    const dummyConversationState = Symbol();
    const dummyConversationId = 'CONVERSATION_ID';
    const dummyStoreSetResult = Symbol();
    const fakeGetTypeAndConversation = sinon.fake.returns({ conversationId: dummyConversationId });
    const fakeStore = createFakeStore(
      sinon.fake.rejects(new Error('Test conversation missing')),
      sinon.fake.resolves(dummyStoreSetResult),
    );
    const fakeLogger = createFakeLogger();
    const fakeNext = sinon.fake();
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = await importConversationStore(
      withGetTypeAndConversation(fakeGetTypeAndConversation),
    );
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
    assert(fakeNext.called);
    assert.notProperty(dummyContext, 'conversation');
    // NOTE: chai types do not offer assertion signatures yet, and neither do node's assert module types.
    if (dummyContext.updateConversation === undefined) {
      assert.fail();
    }
    assert.equal(await dummyContext.updateConversation(dummyConversationState), dummyStoreSetResult);
    assert(fakeStore.set.calledOnce);
    assert(fakeStore.set.calledWith(dummyConversationId, dummyConversationState));
  });

  it('should add to the context for events within a conversation that was previously stored', async () => {
    // Arrange
    const dummyConversationState = Symbol();
    const dummyConversationId = 'CONVERSATION_ID';
    const dummyStoreSetResult = Symbol();
    const fakeGetTypeAndConversation = sinon.fake.returns({ conversationId: dummyConversationId });
    const fakeStore = createFakeStore(
      sinon.fake.resolves(dummyConversationState),
      sinon.fake.resolves(dummyStoreSetResult),
    );
    const fakeLogger = createFakeLogger();
    const fakeNext = sinon.fake();
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = await importConversationStore(
      withGetTypeAndConversation(fakeGetTypeAndConversation),
    );
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
    // NOTE: chai types do not offer assertion signatures yet, and neither do node's assert module types.
    if (dummyContext.updateConversation === undefined) {
      assert.fail();
    }
    const newDummyConversationState = Symbol();
    const result = await dummyContext.updateConversation(newDummyConversationState);
    assert.equal(result, dummyStoreSetResult);
    assert(fakeStore.set.calledOnce);
    assert(fakeStore.set.calledWith(dummyConversationId, newDummyConversationState));
  });
});

describe('MemoryStore', () => {
  describe('constructor', () => {
    it('should initialize successfully', async () => {
      // Arrange
      const { MemoryStore } = await importConversationStore();

      // Act
      const store = new MemoryStore();

      // Assert
      assert.isOk(store);
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
      const { MemoryStore } = await importConversationStore();

      // Act
      const store = new MemoryStore();
      await store.set(dummyConversationId, dummyConversationState);
      const actualConversationState = await store.get(dummyConversationId);

      // Assert
      assert.equal(actualConversationState, dummyConversationState);
    });

    it('should reject lookup of conversation state when the conversation is not stored', async () => {
      // Arrange
      const { MemoryStore } = await importConversationStore();

      // Act
      const store = new MemoryStore();
      try {
        await store.get('CONVERSATION_ID');
        assert.fail();
      } catch (error) {
        // Assert
        assert.instanceOf(error, Error);
        assert.notInstanceOf(error, AssertionError);
      }
    });

    it('should reject lookup of conversation state when the conversation is expired', async () => {
      // Arrange
      const dummyConversationId = 'CONVERSATION_ID';
      const dummyConversationState = Symbol();
      const expiresInMs = 5;
      const { MemoryStore } = await importConversationStore();

      // Act
      const store = new MemoryStore();
      await store.set(dummyConversationId, dummyConversationState, Date.now() + expiresInMs);
      await delay(expiresInMs * 2);
      try {
        await store.get(dummyConversationId);
        assert.fail();
      } catch (error) {
        // Assert
        assert.instanceOf(error, Error);
        assert.notInstanceOf(error, AssertionError);
      }
    });
  });
});
