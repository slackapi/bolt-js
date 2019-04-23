// tslint:disable:ter-prefer-arrow-callback typedef no-implicit-dependencies no-this-assignment
import 'mocha';
import { EventEmitter } from 'events';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { ErrorCode } from './errors';
import { Receiver, ReceiverEvent, Middleware, AnyMiddlewareArgs } from './types';
import { ConversationStore } from './conversation-store';
import { Logger } from '@slack/logger';

describe('App', () => {
  describe('constructor', () => {
    // TODO: test when the single team authorization results fail. that should still succeed but warn. it also means
    // that the `ignoreSelf` middleware will fail (or maybe just warn) a bunch.
    describe('with successful single team authorization results', () => {
      it('should succeed with a token for single team authorization', async () => {
        const { App } = await importAppWhichFetchesOwnBotIds();
        new App({ token: '', signingSecret: '' }); // tslint:disable-line:no-unused-expression
      });
    });
    it('should succeed with an authorize callback', async () => {
      const { App } = await importApp();
      const authorizeCallback = sinon.spy();
      new App({ authorize: authorizeCallback, signingSecret: '' }); // tslint:disable-line:no-unused-expression
      assert(authorizeCallback.notCalled);
    });
    it('should fail without a token  for single team authorization or authorize callback', async () => {
      const { App } = await importApp();
      try {
        new App({ signingSecret: '' }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both a token and authorize callback are specified', async () => {
      const { App } = await importApp();
      const authorizeCallback = sinon.spy();
      try {
         // tslint:disable-next-line:no-unused-expression
        new App({ token: '', authorize: authorizeCallback, signingSecret: '' });
        assert.fail();
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    describe('with a custom receiver', () => {
      it('should succeed with no signing secret for the default receiver', async () => {
        const { App } = await importApp();
        const mockReceiver = createMockReceiver();
        new App({ receiver: mockReceiver, authorize: sinon.spy() }); // tslint:disable-line:no-unused-expression
      });
    });
    it('should fail when no signing secret for the default receiver is specified', async () => {
      const { App } = await importApp();
      try {
        new App({ authorize: sinon.spy() }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should initialize MemoryStore conversation store by default', async () => {
      const { App, memoryStoreStub, conversationContextStub } = await importApp();
      new App({ authorize: sinon.spy(), signingSecret: '' }); // tslint:disable-line:no-unused-expression
      assert(memoryStoreStub.calledWithNew);
      assert((conversationContextStub as SinonSpy).called);
    });
    it('should initialize without a conversation store when option is false', async () => {
      const { App, conversationContextStub } = await importApp();
      // tslint:disable-next-line:no-unused-expression
      new App({ convoStore: false, authorize: sinon.spy(), signingSecret: '' });
      assert((conversationContextStub as SinonSpy).notCalled);
    });
    describe('with a custom conversation store', () => {
      it('should initialize the conversation store', async () => {
        const { App, conversationContextStub } = await importApp();
        const mockConvoStore = createMockConvoStore();
        // tslint:disable-next-line:no-unused-expression
        new App({ convoStore: mockConvoStore, authorize: sinon.spy(), signingSecret: '' });
        assert((conversationContextStub as SinonSpy).firstCall.calledWith(mockConvoStore));
      });
    });
    // TODO: tests for ignoreSelf option
    // TODO: tests for logger and logLevel option
    // TODO: tests for providing botId and botUserId options
    // TODO: tests for providing endpoints option
  });

  describe('#start', () => {
    it('should pass calls through to receiver', async () => {
      const { App } = await importApp();
      const mockReceiver = createMockReceiver();
      const mockReturns = Symbol();
      const mockParameterList = [Symbol(), Symbol()];
      mockReceiver.start = sinon.fake.resolves(mockReturns);
      const app = new App({ receiver: mockReceiver, authorize: sinon.spy() });
      const actualMockReturns = await app.start(...mockParameterList);
      assert.equal(actualMockReturns, mockReturns);
      assert.deepEqual(mockParameterList, (mockReceiver.start as SinonSpy).firstCall.args);
    });
  });

  describe('#stop', () => {
    it('should pass calls through to receiver', async () => {
      const { App } = await importApp();
      const mockReceiver = createMockReceiver();
      const mockReturns = Symbol();
      const mockParameterList = [Symbol(), Symbol()];
      mockReceiver.stop = sinon.fake.resolves(mockReturns);
      const app = new App({ receiver: mockReceiver, authorize: sinon.spy() });
      const actualMockReturns = await app.stop(...mockParameterList);
      assert.equal(actualMockReturns, mockReturns);
      assert.deepEqual(mockParameterList, (mockReceiver.stop as SinonSpy).firstCall.args);
    });
  });

  describe('event processing', () => {
    it('should warn and skip when processing a receiver event with unknown type (never crash)', async () => {
      const { App } = await importApp();
      const mockReceiver = createMockReceiver();
      const invalidReceiverEvents = createInvalidReceiverEvents();
      const spyLogger = createSpyLogger();
      const spyMiddleware = createSpyMiddleware();
      const app = new App({ receiver: mockReceiver, logger: spyLogger, authorize: sinon.spy() });
      app.use(spyMiddleware);
      for (const event of invalidReceiverEvents) {
        (mockReceiver as unknown as EventEmitter).emit('message', event);
      }
      assert((spyMiddleware as SinonSpy).notCalled);
      assert.isAtLeast((spyLogger.warn as SinonSpy).callCount, invalidReceiverEvents.length);
    });
    it('should warn, send to global error handler, and skip when a receiver event fails authorization', async () => {
      const { App } = await importApp();
      const mockReceiver = createMockReceiver();
      const mockReceiverEvent = createMockReceiverEvent();
      const spyLogger = createSpyLogger();
      const spyMiddleware = createSpyMiddleware();
      const spyErrorHandler = sinon.spy();
      const rejection = new Error();
      const app = new App({ receiver: mockReceiver, logger: spyLogger, authorize: sinon.fake.rejects(rejection) });
      app.use(spyMiddleware);
      app.error(spyErrorHandler);
      (mockReceiver as unknown as EventEmitter).emit('message', mockReceiverEvent);
      await delay();
      assert((spyMiddleware as SinonSpy).notCalled);
      assert((spyLogger.warn as SinonSpy).called);
      assert.instanceOf(spyErrorHandler.firstCall.args[0], Error);
      assert.propertyVal(spyErrorHandler.firstCall.args[0], 'code', ErrorCode.AuthorizationError);
      assert.propertyVal(spyErrorHandler.firstCall.args[0], 'original', rejection);
    });
    describe('global middleware', () => {
      it('should process receiver events in order or #use', async () => {
        const { App } = await importApp();
        const mockReceiver = createMockReceiver();
        const mockReceiverEvent = createMockReceiverEvent();
        const spyFirstMiddleware = createSpyMiddleware();
        const spySecondMiddleware = createSpyMiddleware();
        const app = new App({ receiver: mockReceiver, authorize: sinon.fake.resolves({ botToken: '', botId: '' }) });
        app.use(spyFirstMiddleware);
        app.use(spySecondMiddleware);
        (mockReceiver as unknown as EventEmitter).emit('message', mockReceiverEvent);
        await delay();
        assert((spyFirstMiddleware as SinonSpy).calledOnce);
        assert((spyFirstMiddleware as SinonSpy).calledBefore(spySecondMiddleware as SinonSpy));
        assert((spySecondMiddleware as SinonSpy).calledOnce);
      });
    });
  });
});

/* Test Helpers */

async function importAppWhichFetchesOwnBotIds() {
  const fakeBotUserId = 'fake_bot_user_id';
  const fakeBotId = 'fake_bot_id';
  const App = (await rewiremock.module(() => import('./App'), { // tslint:disable-line:variable-name
    '@slack/web-api': {
      WebClient: class {
        public readonly auth = {
          test: sinon.fake.resolves({ user_id: fakeBotUserId }),
        };
        public readonly users = {
          info: sinon.fake.resolves({
            user: {
              profile: {
                bot_id: fakeBotId,
              },
            },
          }),
        };
        public readonly chat = {
          postMessage: sinon.fake.resolves({}),
        };
      },
      addAppMetadata: sinon.fake(),
    },
  })).default;

  return {
    fakeBotId,
    fakeBotUserId,
    App,
  };
}

async function importApp() {
  const memoryStoreStub = sinon.stub();
  const conversationContextStub: typeof import('./conversation-store').conversationContext =
    sinon.spy(() => createSpyMiddleware());
  const App = (await rewiremock.module(() => import('./App'), { // tslint:disable-line:variable-name
    '@slack/web-api': {
      WebClient: class {
        public readonly chat = {
          postMessage: sinon.fake.resolves({}),
        };
      },
      addAppMetadata: sinon.fake(),
    },
    './conversation-store': {
      conversationContext: conversationContextStub,
      MemoryStore: memoryStoreStub,
    },
  })).default;

  return {
    App,
    memoryStoreStub,
    conversationContextStub,
  };
}

function createSpyMiddleware(): Middleware<AnyMiddlewareArgs> {
  return sinon.spy(({ next }) => { next(); });
}

function createMockReceiver(): Receiver {
  const mock = new EventEmitter();
  (mock as unknown as Receiver).start = sinon.fake.resolves(undefined);
  (mock as unknown as Receiver).stop = sinon.fake.resolves(undefined);
  return mock as unknown as Receiver;
}

function createMockConvoStore(): ConversationStore {
  return {
    set: sinon.fake.resolves(undefined),
    get: sinon.fake.resolves(undefined),
  };
}

function createSpyLogger(): Logger {
  return {
    setLevel: sinon.fake(),
    setName: sinon.fake(),
    debug: sinon.fake(),
    info: sinon.fake(),
    warn: sinon.fake(),
    error: sinon.fake(),
  };
}

function createInvalidReceiverEvents(): ReceiverEvent[] {
  // TODO: create many more invalid receiver events (fuzzing)
  return [{
    body: {},
    respond: sinon.fake(),
    ack: sinon.fake(),
  }];
}

function createMockReceiverEvent(): ReceiverEvent {
  return {
    body: {
      event: {
      },
    },
    respond: sinon.fake(),
    ack: sinon.fake(),
  };
}

function delay(ms: number = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
