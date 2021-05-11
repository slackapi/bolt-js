// eslint-disable import/no-extraneous-dependencies
import 'mocha';
import { assert, AssertionError } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { Override, createFakeLogger, delay } from './test-helpers';
import rewiremock from 'rewiremock';
import { ConversationStore } from './conversation-store';
import { AnyMiddlewareArgs, NextFn, Context } from './types';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/logger';

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

  // TODO: test that expiresAt is passed through on calls to store.set

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
      const { MemoryStore } = await importConversationStore(); // eslint-disable-line @typescript-eslint/naming-convention

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
      const { MemoryStore } = await importConversationStore(); // eslint-disable-line @typescript-eslint/naming-convention

      // Act
      const store = new MemoryStore();
      await store.set(dummyConversationId, dummyConversationState);
      const actualConversationState = await store.get(dummyConversationId);

      // Assert
      assert.equal(actualConversationState, dummyConversationState);
    });

    it('should reject lookup of conversation state when the conversation is not stored', async () => {
      // Arrange
      const { MemoryStore } = await importConversationStore(); // eslint-disable-line @typescript-eslint/naming-convention

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
      const { MemoryStore } = await importConversationStore(); // eslint-disable-line @typescript-eslint/naming-convention

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

/* Testing Harness */

type MiddlewareArgs = AnyMiddlewareArgs & {
  next: NextFn;
  context: Context;
  logger: Logger;
  client: WebClient;
};

interface DummyContext<ConversationState> {
  conversation?: ConversationState;
  updateConversation?: (c: ConversationState) => Promise<unknown>;
}

// Loading the system under test using overrides
async function importConversationStore(overrides: Override = {}): Promise<typeof import('./conversation-store')> {
  return rewiremock.module(() => import('./conversation-store'), overrides);
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
interface FakeStore extends ConversationStore {
  set: SinonSpy<Parameters<ConversationStore['set']>, ReturnType<ConversationStore['set']>>;
  get: SinonSpy<Parameters<ConversationStore['get']>, ReturnType<ConversationStore['get']>>;
}

function createFakeStore(
  getSpy: SinonSpy = sinon.fake.resolves(undefined),
  setSpy: SinonSpy = sinon.fake.resolves({}),
): FakeStore {
  return {
    // NOTE (Nov 2019): We had to convert to 'unknown' first due to the following error:
    // src/conversation-store.spec.ts:223:10 - error TS2352: Conversion of type 'SinonSpy<any[], any>' to
    // type 'SinonSpy<[string, any, (number | undefined)?], Promise<unknown>>' may be a mistake because neither type
    // sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    //   Types of property 'firstCall' are incompatible.
    //     Type 'SinonSpyCall<any[], any>' is not comparable to type 'SinonSpyCall<[string, any, (number | undefined)?],
    // Promise<unknown>>'.
    //       Type 'any[]' is not comparable to type '[string, any, (number | undefined)?]'.
    // 223     set: setSpy as SinonSpy<Parameters<ConversationStore['set']>, ReturnType<ConversationStore['set']>>,
    //              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    set: setSpy as unknown as SinonSpy<Parameters<ConversationStore['set']>, ReturnType<ConversationStore['set']>>,
    get: getSpy as unknown as SinonSpy<Parameters<ConversationStore['get']>, ReturnType<ConversationStore['get']>>,
  };
}
