// tslint:disable:no-implicit-dependencies no-object-literal-type-assertion
import 'mocha';
import { assert } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import rewiremock from 'rewiremock';
import { ConversationStore } from './conversation-store';
import { AnyMiddlewareArgs, NextMiddleware, Context } from './types';
import { Logger } from '@slack/logger';

interface DummyContext<ConversationState> {
  conversation?: ConversationState;
  updateConversation?: (c: ConversationState) => Promise<unknown>;
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
    const fakeArgs = { body: {}, context: dummyContext, next: fakeNext } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore, fakeLogger);
    middleware(fakeArgs);

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
    const { fn: next, promise: onNextFirstCall } = wrapToResolveOnFirstCall(assertions);
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = await importConversationStore(
      withGetTypeAndConversation(fakeGetTypeAndConversation),
    );
    const fakeArgs = { next, body: {}, context: dummyContext } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore, fakeLogger);
    middleware(fakeArgs);

    // Assert
    async function assertions(...args: any[]): Promise<void> {
      assert.notExists(args[0]);
      assert.notProperty(dummyContext, 'conversation');
      if (dummyContext.updateConversation !== undefined) {
        const result = await dummyContext.updateConversation(dummyConversationState);
        assert.equal(result, dummyStoreSetResult);
        assert(fakeStore.set.calledOnce);
        assert(fakeStore.set.calledWith(dummyConversationId, dummyConversationState));
      } else {
        assert.fail();
      }
    }
    return onNextFirstCall;
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
    const { fn: next, promise: onNextFirstCall } = wrapToResolveOnFirstCall(assertions);
    const dummyContext: DummyContext<symbol> = {};
    const { conversationContext } = await importConversationStore(
      withGetTypeAndConversation(fakeGetTypeAndConversation),
    );
    const fakeArgs = { next, body: {}, context: dummyContext } as unknown as MiddlewareArgs;

    // Act
    const middleware = conversationContext(fakeStore, fakeLogger);
    middleware(fakeArgs);

    // Assert
    async function assertions(...args: any[]): Promise<void> {
      assert.notExists(args[0]);
      assert.equal(dummyContext.conversation, dummyConversationState);
      if (dummyContext.updateConversation !== undefined) {
        const newDummyConversationState = Symbol();
        const result = await dummyContext.updateConversation(newDummyConversationState);
        assert.equal(result, dummyStoreSetResult);
        assert(fakeStore.set.calledOnce);
        assert(fakeStore.set.calledWith(dummyConversationId, newDummyConversationState));
      } else {
        assert.fail();
      }
    }
    return onNextFirstCall;
  });
});

/* Testing Harness */

type MiddlewareArgs = AnyMiddlewareArgs & { next: NextMiddleware, context: Context };

// Loading the system under test using overrides
async function importConversationStore(
  overrides: Override = {},
): Promise<typeof import('./conversation-store')> {
  return rewiremock.module(() => import('./conversation-store'), overrides);
}

// Composable overrides
// TODO: DRY this up with the duplicate definition in App.spec.ts
interface Override {
  [packageName: string]: {
    [exportName: string]: any;
  };
}

function withGetTypeAndConversation(spy: SinonSpy): Override {
  return {
    './helpers': {
      getTypeAndConversation: spy,
    },
  };
}

// TODO: DRY up fake logger code

interface FakeLogger extends Logger {
  setLevel: SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>;
  setName: SinonSpy<Parameters<Logger['setName']>, ReturnType<Logger['setName']>>;
  debug: SinonSpy<Parameters<Logger['debug']>, ReturnType<Logger['debug']>>;
  info: SinonSpy<Parameters<Logger['info']>, ReturnType<Logger['info']>>;
  warn: SinonSpy<Parameters<Logger['warn']>, ReturnType<Logger['warn']>>;
  error: SinonSpy<Parameters<Logger['error']>, ReturnType<Logger['error']>>;
}

function createFakeLogger(): FakeLogger {
  return {
    // NOTE: the two casts are because of a TypeScript inconsistency with tuple types and any[]. all tuple types
    // should be assignable to any[], but TypeScript doesn't think so.
    setLevel: sinon.fake() as SinonSpy<Parameters<Logger['setLevel']>, ReturnType<Logger['setLevel']>>,
    setName: sinon.fake() as SinonSpy<Parameters<Logger['setName']>, ReturnType<Logger['setName']>>,
    debug: sinon.fake(),
    info: sinon.fake(),
    warn: sinon.fake(),
    error: sinon.fake(),
  };
}

interface FakeStore extends ConversationStore {
  set: SinonSpy<Parameters<ConversationStore['set']>, ReturnType<ConversationStore['set']>>;
  get: SinonSpy<Parameters<ConversationStore['get']>, ReturnType<ConversationStore['get']>>;
}

function createFakeStore(
  getSpy: SinonSpy = sinon.fake.resolves(undefined),
  setSpy: SinonSpy = sinon.fake.resolves({}),
): FakeStore {
  return {
    set: setSpy as SinonSpy<Parameters<ConversationStore['set']>, ReturnType<ConversationStore['set']>>,
    get: getSpy as SinonSpy<Parameters<ConversationStore['get']>, ReturnType<ConversationStore['get']>>,
  };
}

function wrapToResolveOnFirstCall<T extends (...args: any[]) => void>(
  original: T,
  timeoutMs: number = 1000,
): { fn: (...args: Parameters<T>) => Promise<void>; promise: Promise<void>; } {
  // tslint:disable-next-line:no-empty
  let firstCallResolve: (value?: void | PromiseLike<void>) => void = () => { };
  let firstCallReject: (reason?: any) => void = () => { }; // tslint:disable-line:no-empty

  const firstCallPromise: Promise<void> = new Promise((resolve, reject) => {
    firstCallResolve = resolve;
    firstCallReject = reject;
  });

  const wrapped = async function (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<void> {
    try {
      await original.call(this, ...args);
      firstCallResolve();
    } catch (error) {
      firstCallReject(error);
    }
  };

  setTimeout(
    () => {
      firstCallReject(new Error('First call to function took longer than expected'));
    },
    timeoutMs,
  );

  return {
    promise: firstCallPromise,
    fn: wrapped,
  };
}
