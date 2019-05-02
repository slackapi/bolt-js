// tslint:disable:ter-prefer-arrow-callback typedef no-implicit-dependencies no-this-assignment
import 'mocha';
import { EventEmitter } from 'events';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { ErrorCode } from './errors';
import { Receiver, ReceiverEvent, SayFn, NextMiddleware } from './types';
import { ConversationStore } from './conversation-store';
import { Logger } from '@slack/logger';

describe('App', () => {
  describe('constructor', () => {
    // TODO: test when the single team authorization results fail. that should still succeed but warn. it also means
    // that the `ignoreSelf` middleware will fail (or maybe just warn) a bunch.
    describe('with successful single team authorization results', () => {
      it('should succeed with a token for single team authorization', async () => {
        // Arrange
        const fakeBotId = 'B_FAKE_BOT_ID';
        const fakeBotUserId = 'U_FAKE_BOT_USER_ID';
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withSuccessfulBotUserFetchingWebClient(fakeBotId, fakeBotUserId),
        );
        const App = await newImportApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ token: '', signingSecret: '' });

        // Assert
        // TODO: verify that the fake bot ID and fake bot user ID are retrieved
        assert.instanceOf(app, App);
      });
    });
    it('should succeed with an authorize callback', async () => {
      // Arrange
      const authorizeCallback = sinon.spy();
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ authorize: authorizeCallback, signingSecret: '' });

      // Assert
      assert(authorizeCallback.notCalled, 'Should not call the authorize callback on instantiation');
      assert.instanceOf(app, App);
    });
    it('should fail without a token for single team authorization or authorize callback', async () => {
      // Arrange
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      try {
        new App({ signingSecret: '' }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should fail when both a token and authorize callback are specified', async () => {
      // Arrange
      const authorizeCallback = sinon.spy();
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      try {
        // tslint:disable-next-line:no-unused-expression
        new App({ token: '', authorize: authorizeCallback, signingSecret: '' });
        assert.fail();
      } catch (error) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
        assert(authorizeCallback.notCalled);
      }
    });
    describe('with a custom receiver', () => {
      it('should succeed with no signing secret', async () => {
        // Arrange
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withNoopWebClient(),
        );
        const App = await newImportApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ receiver: createFakeReceiver(), authorize: sinon.spy() });

        // Assert
        assert.instanceOf(app, App);
      });
    });
    it('should fail when no signing secret for the default receiver is specified', async () => {
      // Arrange
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      try {
        new App({ authorize: sinon.spy() }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should initialize MemoryStore conversation store by default', async () => {
      // Arrange
      const memoryStoreSpy = sinon.spy();
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withMemoryStore(memoryStoreSpy),
        withConversationContext(fakeConversationContext),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ authorize: sinon.spy(), signingSecret: '' });

      // Assert
      assert.instanceOf(app, App);
      assert(memoryStoreSpy.calledWithNew);
      assert(fakeConversationContext.called);
    });
    it('should initialize without a conversation store when option is false', async () => {
      // Arrange
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withConversationContext(fakeConversationContext),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ convoStore: false, authorize: sinon.spy(), signingSecret: '' });

      // Assert
      assert.instanceOf(app, App);
      assert(fakeConversationContext.notCalled);
    });
    describe('with a custom conversation store', () => {
      it('should initialize the conversation store', async () => {
        // Arrange
        const fakeConversationContext = sinon.fake.returns(noopMiddleware);
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withNoopWebClient(),
          withConversationContext(fakeConversationContext),
        );
        const dummyConvoStore = Symbol() as unknown as ConversationStore;
        const App = await newImportApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ convoStore: dummyConvoStore, authorize: sinon.spy(), signingSecret: '' });

        // Assert
        assert.instanceOf(app, App);
        assert(fakeConversationContext.firstCall.calledWith(dummyConvoStore));
      });
    });
    // TODO: tests for ignoreSelf option
    // TODO: tests for logger and logLevel option
    // TODO: tests for providing botId and botUserId options
    // TODO: tests for providing endpoints option
  });

  describe('#start', () => {
    it('should pass calls through to receiver', async () => {
      // Arrange
      const dummyReturn = Symbol();
      const dummyParams = [Symbol(), Symbol()];
      const fakeReceiver = createFakeReceiver(sinon.fake.resolves(dummyReturn));
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, authorize: sinon.spy() });
      const actualReturn = await app.start(...dummyParams);

      // Assert
      assert.equal(actualReturn, dummyReturn);
      assert.deepEqual(dummyParams, fakeReceiver.start.firstCall.args);
    });
  });

  describe('#stop', () => {
    it('should pass calls through to receiver', async () => {
      // Arrange
      const dummyReturn = Symbol();
      const dummyParams = [Symbol(), Symbol()];
      const fakeReceiver = createFakeReceiver(undefined, sinon.fake.resolves(dummyReturn));
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, authorize: sinon.spy() });
      const actualReturn = await app.stop(...dummyParams);

      // Assert
      assert.equal(actualReturn, dummyReturn);
      assert.deepEqual(dummyParams, fakeReceiver.stop.firstCall.args);
    });
  });

  describe('event processing', () => {
    // TODO: verify that authorize callback is called with the correct properties and responds correctly to
    // various return values
    it('should warn and skip when processing a receiver event with unknown type (never crash)', async () => {
      // Arrange
      const fakeReceiver = createFakeReceiver();
      const fakeLogger = createFakeLogger();
      const fakeMiddleware = sinon.spy(noopMiddleware);
      const invalidReceiverEvents = createInvalidReceiverEvents();
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, logger: fakeLogger, authorize: sinon.spy() });
      app.use(fakeMiddleware);
      for (const event of invalidReceiverEvents) {
        fakeReceiver.emit('message', event);
      }

      // Assert
      assert(fakeMiddleware.notCalled);
      assert.isAtLeast(fakeLogger.warn.callCount, invalidReceiverEvents.length);
    });
    it('should warn, send to global error handler, and skip when a receiver event fails authorization', async () => {
      // Arrange
      const fakeReceiver = createFakeReceiver();
      const fakeLogger = createFakeLogger();
      const fakeMiddleware = sinon.spy(noopMiddleware);
      const fakeErrorHandler = sinon.fake();
      const dummyAuthorizationError = new Error();
      const dummyReceiverEvent = createDummyReceiverEvent();
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
      );
      const App = await newImportApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({
        receiver: fakeReceiver,
        logger: fakeLogger,
        authorize: sinon.fake.rejects(dummyAuthorizationError),
      });
      app.use(fakeMiddleware);
      app.error(fakeErrorHandler);
      fakeReceiver.emit('message', dummyReceiverEvent);
      await delay();

      // Assert
      assert(fakeMiddleware.notCalled);
      assert(fakeLogger.warn.called);
      assert.instanceOf(fakeErrorHandler.firstCall.args[0], Error);
      assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'code', ErrorCode.AuthorizationError);
      assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'original', dummyAuthorizationError);
    });
    describe('global middleware', () => {
      it('should process receiver events in order of #use', async () => {
        // Arrange
        const fakeReceiver = createFakeReceiver();
        const fakeFirstMiddleware = sinon.spy(noopMiddleware);
        const fakeSecondMiddleware = sinon.spy(noopMiddleware);
        const dummyReceiverEvent = createDummyReceiverEvent();
        const dummyAuthorizationResult = { botToken: '', botId: '' };
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withNoopWebClient(),
          withMemoryStore(sinon.fake()),
          withConversationContext(sinon.fake.returns(noopMiddleware)),
        );
        const App = await newImportApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(fakeFirstMiddleware);
        app.use(fakeSecondMiddleware);
        fakeReceiver.emit('message', dummyReceiverEvent);
        await delay(10);

        // Assert
        assert(fakeFirstMiddleware.calledOnce);
        assert(fakeFirstMiddleware.calledBefore(fakeSecondMiddleware));
        assert(fakeSecondMiddleware.calledOnce);
      });
    });
    describe('middleware and listener arguments', () => {
      describe('say()', () => {
        it.skip('should send a message to a channel where the incoming event originates', async () => {
          // Arrange
          const fakeReceiver = createFakeReceiver();
          const fakePostMessage = sinon.fake();
          const dummyReceiverEvent = createDummyReceiverEvent();
          const dummyMessage = 'test';
          const overrides = mergeOverrides(
            withNoopAppMetadata(),
            withPostMessage(fakePostMessage),
            withMemoryStore(sinon.fake()),
            withConversationContext(sinon.fake.returns(noopMiddleware)),
          );
          const App = await newImportApp(overrides); // tslint:disable-line:variable-name

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.spy() });
          app.use((args) => {
            // By definition, the mockEvents should all produce a say function, so we cast args.say into a SayFn
            const say = (args as any).say as SayFn;
            say(dummyMessage);
          });
          fakeReceiver.emit('message', dummyReceiverEvent);
          await delay();

          // Assert
          // TODO
        });
      });
    });
  });
});

/* Test Helpers */

const noopMiddleware = ({ next }: { next: NextMiddleware; }) => { next(); };
const noop = () => {  }; // tslint:disable-line:no-empty

interface Override {
  [packageName: string]: {
    [exportName: string]: any;
  };
}

function withNoopWebClient(): Override {
  return {
    '@slack/web-api': {
      WebClient: class {},
    },
  };
}

function withNoopAppMetadata(): Override {
  return {
    '@slack/web-api': {
      addAppMetadata: sinon.fake(),
    },
  };
}

// TODO: see if we can use a partial type for the return value
function withSuccessfulBotUserFetchingWebClient(botId: string, botUserId: string): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public auth = {
          test: sinon.fake.resolves({ user_id: botUserId }),
        };
        public users = {
          info: sinon.fake.resolves({
            user: {
              profile: {
                bot_id: botId,
              },
            },
          }),
        };
      },
    },
  };
}

function withPostMessage(spy: SinonSpy): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public chat = {
          postMessage: spy,
        };
      },
    },
  };
}

function withMemoryStore(spy: SinonSpy): Override {
  return {
    './conversation-store': {
      MemoryStore: spy,
    },
  };
}

function withConversationContext(spy: SinonSpy): Override {
  return {
    './conversation-store': {
      conversationContext: spy,
    },
  };
}

function mergeOverrides(...overrides: Override[]): Override {
  let currentOverrides: Override = {};
  for (const override of overrides) {
    currentOverrides = mergeObjProperties(currentOverrides, override);
  }
  return currentOverrides;
}

function mergeObjProperties(first: Override, second: Override): Override {
  const merged: Override = {};
  const props = Object.keys(first).concat(Object.keys(second));
  for (const prop of props) {
    if (second[prop] === undefined && first[prop] !== undefined) {
      merged[prop] = first[prop];
    } else if (first[prop] === undefined && second[prop] !== undefined) {
      merged[prop] = second[prop];
    } else {
      // second always overwrites the first
      merged[prop] = { ...first[prop], ...second[prop] };
    }
  }
  return merged;
}

async function newImportApp(overrides: any): Promise<typeof import('./App').default> {
  return (await rewiremock.module(() => import('./App'), overrides)).default;
}

// async function importApp() {
//   const memoryStoreStub = sinon.stub();
//   const conversationContextStub: typeof import('./conversation-store').conversationContext =
//     sinon.spy(() => createSpyMiddleware());
//   const App = (await rewiremock.module(() => import('./App'), { // tslint:disable-line:variable-name
//     '@slack/web-api': {
//       WebClient: class {},
//       addAppMetadata: sinon.fake(),
//     },
//     './conversation-store': {
//       conversationContext: conversationContextStub,
//       MemoryStore: memoryStoreStub,
//     },
//   })).default;

//   return {
//     App,
//     memoryStoreStub,
//     conversationContextStub,
//   };
// }

// function createSpyMiddleware(): Middleware<AnyMiddlewareArgs> {
//   return sinon.spy(({ next }: { next: NextMiddleware; }) => { next(); });
// }

type FakeReceiver = SinonSpy & EventEmitter & {
  start: SinonSpy<Parameters<Receiver['start']>, ReturnType<Receiver['start']>>;
  stop: SinonSpy<Parameters<Receiver['stop']>, ReturnType<Receiver['stop']>>;
};

function createFakeReceiver(
  startSpy: SinonSpy = sinon.fake.resolves(undefined),
  stopSpy: SinonSpy = sinon.fake.resolves(undefined),
): FakeReceiver {
  const mock = new EventEmitter();
  (mock as FakeReceiver).start = startSpy;
  (mock as FakeReceiver).stop = stopSpy;
  return mock as FakeReceiver;
}

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

function createInvalidReceiverEvents(): ReceiverEvent[] {
  // TODO: create many more invalid receiver events (fuzzing)
  return [{
    body: {},
    respond: sinon.fake(),
    ack: sinon.fake(),
  }];
}

function createDummyReceiverEvent(): ReceiverEvent {
  // NOTE: this is a degenerate ReceiverEvent that would successfully pass through the App. it happens to look like a
  // IncomingEventType.Event
  return {
    body: {
      event: {
      },
    },
    respond: noop,
    ack: noop,
  };
}

function delay(ms: number = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// TODO: make default overrides (noop parts) for importApp
// TODO: use noop authorize function instead of sinon.spy() everywhere
// TODO: swap out rewiremock for proxyquire to see if it saves execution time
// TODO: use sinon.fake() instead of sinon.spy() as much as possible
