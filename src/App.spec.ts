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
        const App = await importApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ token: '', signingSecret: '' });

        // Assert
        // TODO: verify that the fake bot ID and fake bot user ID are retrieved
        assert.instanceOf(app, App);
      });
    });
    it('should succeed with an authorize callback', async () => {
      // Arrange
      const authorizeCallback = sinon.fake();
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ authorize: authorizeCallback, signingSecret: '' });

      // Assert
      assert(authorizeCallback.notCalled, 'Should not call the authorize callback on instantiation');
      assert.instanceOf(app, App);
    });
    it('should fail without a token for single team authorization or authorize callback', async () => {
      // Arrange
      const App = await importApp(); // tslint:disable-line:variable-name

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
      const authorizeCallback = sinon.fake();
      const App = await importApp(); // tslint:disable-line:variable-name

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
        const App = await importApp(); // tslint:disable-line:variable-name

        // Act
        const app = new App({ receiver: createFakeReceiver(), authorize: noopAuthorize });

        // Assert
        assert.instanceOf(app, App);
      });
    });
    it('should fail when no signing secret for the default receiver is specified', async () => {
      // Arrange
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      try {
        new App({ authorize: noopAuthorize }); // tslint:disable-line:no-unused-expression
        assert.fail();
      } catch (error) {
        // Assert
        assert.propertyVal(error, 'code', ErrorCode.AppInitializationError);
      }
    });
    it('should initialize MemoryStore conversation store by default', async () => {
      // Arrange
      const fakeMemoryStore = sinon.fake();
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withMemoryStore(fakeMemoryStore),
        withConversationContext(fakeConversationContext),
      );
      const App = await importApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ authorize: noopAuthorize, signingSecret: '' });

      // Assert
      assert.instanceOf(app, App);
      assert(fakeMemoryStore.calledWithNew);
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
      const App = await importApp(overrides); // tslint:disable-line:variable-name

      // Act
      const app = new App({ convoStore: false, authorize: noopAuthorize, signingSecret: '' });

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
        const App = await importApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ convoStore: dummyConvoStore, authorize: noopAuthorize, signingSecret: '' });

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
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, authorize: noopAuthorize });
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
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, authorize: noopAuthorize });
      const actualReturn = await app.stop(...dummyParams);

      // Assert
      assert.equal(actualReturn, dummyReturn);
      assert.deepEqual(dummyParams, fakeReceiver.stop.firstCall.args);
    });
  });

  describe('event processing', () => {
    // TODO: verify that authorize callback is called with the correct properties and responds correctly to
    // various return values

    function createInvalidReceiverEvents(): ReceiverEvent[] {
      // TODO: create many more invalid receiver events (fuzzing)
      return [{
        body: {},
        respond: sinon.fake(),
        ack: sinon.fake(),
      }];
    }

    it('should warn and skip when processing a receiver event with unknown type (never crash)', async () => {
      // Arrange
      const fakeReceiver = createFakeReceiver();
      const fakeLogger = createFakeLogger();
      const fakeMiddleware = sinon.fake(noopMiddleware);
      const invalidReceiverEvents = createInvalidReceiverEvents();
      const App = await importApp(); // tslint:disable-line:variable-name

      // Act
      const app = new App({ receiver: fakeReceiver, logger: fakeLogger, authorize: noopAuthorize });
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
      const fakeMiddleware = sinon.fake(noopMiddleware);
      const fakeErrorHandler = sinon.fake();
      const dummyAuthorizationError = new Error();
      const dummyReceiverEvent = createDummyReceiverEvent();
      const App = await importApp(); // tslint:disable-line:variable-name

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
        const fakeFirstMiddleware = sinon.fake(noopMiddleware);
        const fakeSecondMiddleware = sinon.fake(noopMiddleware);
        const dummyReceiverEvent = createDummyReceiverEvent();
        const dummyAuthorizationResult = { botToken: '', botId: '' };
        const overrides = mergeOverrides(
          withNoopAppMetadata(),
          withNoopWebClient(),
          withMemoryStore(sinon.fake()),
          withConversationContext(sinon.fake.returns(noopMiddleware)),
        );
        const App = await importApp(overrides); // tslint:disable-line:variable-name

        // Act
        const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
        app.use(fakeFirstMiddleware);
        app.use(fakeSecondMiddleware);
        fakeReceiver.emit('message', dummyReceiverEvent);
        await delay();

        // Assert
        assert(fakeFirstMiddleware.calledOnce);
        assert(fakeFirstMiddleware.calledBefore(fakeSecondMiddleware));
        assert(fakeSecondMiddleware.calledOnce);
      });
    });
    describe('middleware and listener arguments', () => {
      describe('say()', () => {

        function createChannelContextualReceiverEvents(channelId: string): ReceiverEvent[] {
          return [
            // IncomingEventType.Event with channel in payload
            {
              body: {
                event: {
                  channel: channelId,
                },
                team_id: 'TEAM_ID',
              },
              respond: noop,
              ack: noop,
            },
            // IncomingEventType.Event with channel in item
            {
              body: {
                event: {
                  item: {
                    channel: channelId,
                  },
                },
                team_id: 'TEAM_ID',
              },
              respond: noop,
              ack: noop,
            },
            // IncomingEventType.Command
            {
              body: {
                command: '/COMMAND_NAME',
                channel_id: channelId,
                team_id: 'TEAM_ID',
              },
              respond: noop,
              ack: noop,
            },
            // IncomingEventType.Action from block action, interactive message, or message action
            {
              body: {
                actions: [{}],
                channel: {
                  id: channelId,
                },
                user: {
                  id: 'USER_ID',
                },
                team: {
                  id: 'TEAM_ID',
                },
              },
              respond: noop,
              ack: noop,
            },
            // IncomingEventType.Action from dialog submission
            {
              body: {
                type: 'dialog_submission',
                channel: {
                  id: channelId,
                },
                user: {
                  id: 'USER_ID',
                },
                team: {
                  id: 'TEAM_ID',
                },
              },
              respond: noop,
              ack: noop,
            },
          ];
        }

        it('should send a simple message to a channel where the incoming event originates', async () => {
          // Arrange
          const fakeReceiver = createFakeReceiver();
          const fakePostMessage = sinon.fake.resolves({});
          const fakeErrorHandler = sinon.fake();
          const dummyAuthorizationResult = { botToken: '', botId: '' };
          const dummyMessage = 'test';
          const dummyChannelId = 'CHANNEL_ID';
          const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);
          const overrides = mergeOverrides(
            withNoopAppMetadata(),
            withPostMessage(fakePostMessage),
            withMemoryStore(sinon.fake()),
            withConversationContext(sinon.fake.returns(noopMiddleware)),
          );
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.use((args) => {
            // By definition, these events should all produce a say function, so we cast args.say into a SayFn
            const say = (args as any).say as SayFn;
            say(dummyMessage);
          });
          app.error(fakeErrorHandler);
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

          // Assert
          assert.equal(fakePostMessage.callCount, dummyReceiverEvents.length);
          // Assert that each call to fakePostMessage had the right arguments
          fakePostMessage.getCalls().forEach((call) => {
            const firstArg = call.args[0];
            assert.propertyVal(firstArg, 'text', dummyMessage);
            assert.propertyVal(firstArg, 'channel', dummyChannelId);
          });
          assert(fakeErrorHandler.notCalled);
        });

        // TODO: DRY up this case with the case above
        it('should send a complex message to a channel where the incoming event originates', async () => {
          // Arrange
          const fakeReceiver = createFakeReceiver();
          const fakePostMessage = sinon.fake.resolves({});
          const fakeErrorHandler = sinon.fake();
          const dummyAuthorizationResult = { botToken: '', botId: '' };
          const dummyMessage = { text: 'test' };
          const dummyChannelId = 'CHANNEL_ID';
          const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);
          const overrides = mergeOverrides(
            withNoopAppMetadata(),
            withPostMessage(fakePostMessage),
            withMemoryStore(sinon.fake()),
            withConversationContext(sinon.fake.returns(noopMiddleware)),
          );
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.use((args) => {
            // By definition, these events should all produce a say function, so we cast args.say into a SayFn
            const say = (args as any).say as SayFn;
            say(dummyMessage);
          });
          app.error(fakeErrorHandler);
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

          // Assert
          assert.equal(fakePostMessage.callCount, dummyReceiverEvents.length);
          // Assert that each call to fakePostMessage had the right arguments
          fakePostMessage.getCalls().forEach((call) => {
            const firstArg = call.args[0];
            assert.propertyVal(firstArg, 'channel', dummyChannelId);
            for (const prop in dummyMessage) {
              assert.propertyVal(firstArg, prop, (dummyMessage as any)[prop]);
            }
          });
          assert(fakeErrorHandler.notCalled);
        });

        function createReceiverEventsWithoutSay(channelId: string): ReceiverEvent[] {
          return [
            // IncomingEventType.Options from block action
            {
              body: {
                type: 'block_suggestion',
                channel: {
                  id: channelId,
                },
                user: {
                  id: 'USER_ID',
                },
                team: {
                  id: 'TEAM_ID',
                },
              },
              respond: noop,
              ack: noop,
            },
            // IncomingEventType.Options from interactive message or dialog
            {
              body: {
                name: 'select_field_name',
                channel: {
                  id: channelId,
                },
                user: {
                  id: 'USER_ID',
                },
                team: {
                  id: 'TEAM_ID',
                },
              },
              respond: noop,
              ack: noop,
            },
            // IncomingEventType.Event without a channel context
            {
              body: {
                event: {
                },
                team_id: 'TEAM_ID',
              },
              respond: noop,
              ack: noop,
            },
          ];
        }

        it('should not exist in the arguments on incoming events that don\'t support say', async () => {
          // Arrange
          const fakeReceiver = createFakeReceiver();
          const assertionAggregator = sinon.fake();
          const dummyAuthorizationResult = { botToken: '', botId: '' };
          const dummyReceiverEvents = createReceiverEventsWithoutSay('CHANNEL_ID');
          const overrides = mergeOverrides(
            withNoopAppMetadata(),
            withNoopWebClient(),
            withMemoryStore(sinon.fake()),
            withConversationContext(sinon.fake.returns(noopMiddleware)),
          );
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.use((args) => {
            assert.isUndefined((args as any).say);
            // If the above assertion fails, then it would throw an AssertionError and the following line will not be
            // called
            assertionAggregator();
          });
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

          // Assert
          assert.equal(assertionAggregator.callCount, dummyReceiverEvents.length);
        });

        it('should handle failures through the App\'s global error handler', async () => {
          // Arrange
          const fakeReceiver = createFakeReceiver();
          const fakePostMessage = sinon.fake.rejects(new Error('fake error'));
          const fakeErrorHandler = sinon.fake();
          const dummyAuthorizationResult = { botToken: '', botId: '' };
          const dummyMessage = { text: 'test' };
          const dummyChannelId = 'CHANNEL_ID';
          const dummyReceiverEvents = createChannelContextualReceiverEvents(dummyChannelId);
          const overrides = mergeOverrides(
            withNoopAppMetadata(),
            withPostMessage(fakePostMessage),
            withMemoryStore(sinon.fake()),
            withConversationContext(sinon.fake.returns(noopMiddleware)),
          );
          const App = await importApp(overrides); // tslint:disable-line:variable-name

          // Act
          const app = new App({ receiver: fakeReceiver, authorize: sinon.fake.resolves(dummyAuthorizationResult) });
          app.use((args) => {
            // By definition, these events should all produce a say function, so we cast args.say into a SayFn
            const say = (args as any).say as SayFn;
            say(dummyMessage);
          });
          app.error(fakeErrorHandler);
          dummyReceiverEvents.forEach(dummyEvent => fakeReceiver.emit('message', dummyEvent));
          await delay();

          // Assert
          assert.equal(fakeErrorHandler.callCount, dummyReceiverEvents.length);
        });
      });
    });
  });
});

/* Testing Harness */

// Loading the system under test using overrides
async function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata(), withNoopWebClient()),
): Promise<typeof import('./App').default> {
  return (await rewiremock.module(() => import('./App'), overrides)).default;
}

// Composable overrides
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

// Fakes
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

// Dummies (values that have no real behavior but pass through the system opaquely)
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

// Utility functions
const noop = () => { }; // tslint:disable-line:no-empty
const noopMiddleware = ({ next }: { next: NextMiddleware; }) => { next(); };
const noopAuthorize = (() => Promise.resolve({}));
function delay(ms: number = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// TODO: swap out rewiremock for proxyquire to see if it saves execution time
