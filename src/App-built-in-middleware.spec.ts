import 'mocha';
import sinon, { SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { Override, mergeOverrides, createFakeLogger, delay } from './test-helpers';
import { ErrorCode, UnknownError, AuthorizationError, CodedError } from './errors';
import {
  Receiver,
  ReceiverEvent,
  NextFn,
} from './types';
import App, { ExtendedErrorHandlerArgs } from './App';

// Utility functions
const noop = () => Promise.resolve(undefined);
const noopMiddleware = async ({ next }: { next: NextFn }) => {
  await next();
};
const noopAuthorize = () => Promise.resolve({});

// Fakes
class FakeReceiver implements Receiver {
  private bolt: App | undefined;

  public init = (bolt: App) => {
    this.bolt = bolt;
  };

  public start = sinon.fake((...params: any[]): Promise<unknown> => Promise.resolve([...params]));

  public stop = sinon.fake((...params: any[]): Promise<unknown> => Promise.resolve([...params]));

  public async sendEvent(event: ReceiverEvent): Promise<void> {
    return this.bolt?.processEvent(event);
  }
}

// Dummies (values that have no real behavior but pass through the system opaquely)
function createDummyReceiverEvent(type: string = 'dummy_event_type'): ReceiverEvent {
  // NOTE: this is a degenerate ReceiverEvent that would successfully pass through the App. it happens to look like a
  // IncomingEventType.Event
  return {
    body: {
      event: {
        type,
      },
    },
    ack: noop,
  };
}

describe('App built-in middleware and mechanism', () => {
  let fakeReceiver: FakeReceiver;
  let fakeErrorHandler: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };

  beforeEach(() => {
    fakeReceiver = new FakeReceiver();
    fakeErrorHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };
  });

  // TODO: verify that authorize callback is called with the correct properties and responds correctly to
  // various return values

  function createInvalidReceiverEvents(): ReceiverEvent[] {
    // TODO: create many more invalid receiver events (fuzzing)
    return [
      {
        body: {},
        ack: sinon.fake.resolves(undefined),
      },
    ];
  }

  it('should warn and skip when processing a receiver event with unknown type (never crash)', async () => {
    // Arrange
    const fakeLogger = createFakeLogger();
    const fakeMiddleware = sinon.fake(noopMiddleware);
    const invalidReceiverEvents = createInvalidReceiverEvents();
    const MockApp = await importApp();

    // Act
    const app = new MockApp({ receiver: fakeReceiver, logger: fakeLogger, authorize: noopAuthorize });
    app.use(fakeMiddleware);
    await Promise.all(invalidReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

    // Assert
    assert(fakeErrorHandler.notCalled);
    assert(fakeMiddleware.notCalled);
    assert.isAtLeast(fakeLogger.warn.callCount, invalidReceiverEvents.length);
  });

  it('should warn, send to global error handler, and skip when a receiver event fails authorization', async () => {
    // Arrange
    const fakeLogger = createFakeLogger();
    const fakeMiddleware = sinon.fake(noopMiddleware);
    const dummyOrigError = new Error('auth failed');
    const dummyAuthorizationError = new AuthorizationError('auth failed', dummyOrigError);
    const dummyReceiverEvent = createDummyReceiverEvent();
    const MockApp = await importApp();

    // Act
    const app = new MockApp({
      receiver: fakeReceiver,
      logger: fakeLogger,
      authorize: sinon.fake.rejects(dummyAuthorizationError),
    });
    app.use(fakeMiddleware);
    app.error(fakeErrorHandler);
    await fakeReceiver.sendEvent(dummyReceiverEvent);

    // Assert
    assert(fakeMiddleware.notCalled);
    assert(fakeLogger.warn.called);
    assert.instanceOf(fakeErrorHandler.firstCall.args[0], Error);
    assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'code', ErrorCode.AuthorizationError);
    assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'original', dummyAuthorizationError.original);
  });

  describe('global middleware', () => {
    let fakeFirstMiddleware: SinonSpy;
    let fakeSecondMiddleware: SinonSpy;
    let app: App;
    let dummyReceiverEvent: ReceiverEvent;

    beforeEach(async () => {
      const fakeConversationContext = sinon.fake.returns(noopMiddleware);
      const overrides = mergeOverrides(
        withNoopAppMetadata(),
        withNoopWebClient(),
        withMemoryStore(sinon.fake()),
        withConversationContext(fakeConversationContext),
      );
      const MockApp = await importApp(overrides);

      dummyReceiverEvent = createDummyReceiverEvent();
      fakeFirstMiddleware = sinon.fake(noopMiddleware);
      fakeSecondMiddleware = sinon.fake(noopMiddleware);

      app = new MockApp({
        logger: createFakeLogger(),
        receiver: fakeReceiver,
        authorize: sinon.fake.resolves(dummyAuthorizationResult),
      });
    });

    it('should error if next called multiple times', async () => {
      // Arrange
      app.use(fakeFirstMiddleware);
      app.use(async ({ next }) => {
        await next();
        await next();
      });
      app.use(fakeSecondMiddleware);
      app.error(fakeErrorHandler);

      // Act
      await fakeReceiver.sendEvent(dummyReceiverEvent);

      // Assert
      assert.instanceOf(fakeErrorHandler.firstCall.args[0], Error);
    });

    it('correctly waits for async listeners', async () => {
      let changed = false;

      app.use(async ({ next }) => {
        await delay(10);
        changed = true;

        await next();
      });

      await fakeReceiver.sendEvent(dummyReceiverEvent);
      assert.isTrue(changed);
      assert(fakeErrorHandler.notCalled);
    });

    it('throws errors which can be caught by upstream async listeners', async () => {
      const thrownError = new Error('Error handling the message :(');
      let caughtError;

      app.use(async ({ next }) => {
        try {
          await next();
        } catch (err: any) {
          caughtError = err;
        }
      });

      app.use(async () => {
        throw thrownError;
      });

      app.error(fakeErrorHandler);

      await fakeReceiver.sendEvent(dummyReceiverEvent);

      assert.equal(caughtError, thrownError);
      assert(fakeErrorHandler.notCalled);
    });

    it('calls async middleware in declared order', async () => {
      const message = ':wave:';
      let middlewareCount = 0;

      /**
       * Middleware that, when called, asserts that it was called in the correct order
       * @param orderDown The order it should be called when processing middleware down the chain
       * @param orderUp The order it should be called when processing middleware up the chain
       */
      const assertOrderMiddleware = (orderDown: number, orderUp: number) => async ({ next }: { next?: NextFn }) => {
        await delay(10);
        middlewareCount += 1;
        assert.equal(middlewareCount, orderDown);
        if (next !== undefined) {
          await next();
        }
        middlewareCount += 1;
        assert.equal(middlewareCount, orderUp);
      };

      app.use(assertOrderMiddleware(1, 8));
      app.message(message, assertOrderMiddleware(3, 6), assertOrderMiddleware(4, 5));
      app.use(assertOrderMiddleware(2, 7));
      app.error(fakeErrorHandler);

      await fakeReceiver.sendEvent({
        ...dummyReceiverEvent,
        body: {
          type: 'event_callback',
          event: {
            type: 'message',
            text: message,
          },
        },
      });

      assert.equal(middlewareCount, 8);
      assert(fakeErrorHandler.notCalled);
    });

    it('should, on error, call the global error handler, not extended', async () => {
      const error = new Error('Everything is broke, you probably should restart, if not then good luck');

      app.use(() => {
        throw error;
      });

      app.error(async (codedError: CodedError) => {
        assert.instanceOf(codedError, UnknownError);
        assert.equal(codedError.message, error.message);
      });

      await fakeReceiver.sendEvent(dummyReceiverEvent);
    });

    it('should, on error, call the global error handler, extended', async () => {
      const error = new Error('Everything is broke, you probably should restart, if not then good luck');
      // Need to change value of private property for testing purposes
      // Accessing through bracket notation because it is private
      // eslint-disable-next-line @typescript-eslint/dot-notation
      app['extendedErrorHandler'] = true;

      app.use(() => {
        throw error;
      });

      app.error(async (args: ExtendedErrorHandlerArgs) => {
        assert.property(args, 'error');
        assert.property(args, 'body');
        assert.property(args, 'context');
        assert.property(args, 'logger');
        assert.isDefined(args.error);
        assert.isDefined(args.body);
        assert.isDefined(args.context);
        assert.isDefined(args.logger);
        assert.equal(args.error.message, error.message);
      });

      await fakeReceiver.sendEvent(dummyReceiverEvent);

      // Need to change value of private property for testing purposes
      // Accessing through bracket notation because it is private
      // eslint-disable-next-line @typescript-eslint/dot-notation
      app['extendedErrorHandler'] = false;
    });

    it('with a default global error handler, rejects App#ProcessEvent', async () => {
      const error = new Error('The worst has happened, bot is beyond saving, always hug servers');
      let actualError;

      app.use(() => {
        throw error;
      });

      try {
        await fakeReceiver.sendEvent(dummyReceiverEvent);
      } catch (err: any) {
        actualError = err;
      }

      assert.instanceOf(actualError, UnknownError);
      assert.equal(actualError.message, error.message);
    });
  });

  describe('listener middleware', () => {
    let app: App;
    const eventType = 'some_event_type';
    const dummyReceiverEvent = createDummyReceiverEvent(eventType);

    beforeEach(async () => {
      const MockAppNoOverrides = await importApp();
      app = new MockAppNoOverrides({
        receiver: fakeReceiver,
        authorize: sinon.fake.resolves(dummyAuthorizationResult),
      });
      app.error(fakeErrorHandler);
    });

    it('should bubble up errors in listeners to the global error handler', async () => {
      // Arrange
      const errorToThrow = new Error('listener error');

      // Act
      app.event(eventType, async () => {
        throw errorToThrow;
      });
      await fakeReceiver.sendEvent(dummyReceiverEvent);

      // Assert
      assert(fakeErrorHandler.calledOnce);
      const error = fakeErrorHandler.firstCall.args[0];
      assert.equal(error.code, ErrorCode.UnknownError);
      assert.equal(error.original, errorToThrow);
    });

    it('should aggregate multiple errors in listeners for the same incoming event', async () => {
      // Arrange
      const errorsToThrow = [new Error('first listener error'), new Error('second listener error')];
      function createThrowingListener(toBeThrown: Error): () => Promise<void> {
        return async () => {
          throw toBeThrown;
        };
      }

      // Act
      app.event(eventType, createThrowingListener(errorsToThrow[0]));
      app.event(eventType, createThrowingListener(errorsToThrow[1]));
      await fakeReceiver.sendEvent(dummyReceiverEvent);

      // Assert
      assert(fakeErrorHandler.calledOnce);
      const error = fakeErrorHandler.firstCall.args[0];
      assert.instanceOf(error, Error);
      assert(error.code === ErrorCode.MultipleListenerError);
      assert.sameMembers(error.originals, errorsToThrow);
    });

    it('should detect invalid event names', async () => {
      app.event('app_mention', async () => {});
      app.event('message', async () => {});
      assert.throws(() => app.event('message.channels', async () => {}), 'Although the document mentions');
      assert.throws(() => app.event(/message\..+/, async () => {}), 'Although the document mentions');
    });
  });

  describe('middleware and listener arguments', () => {
    let overrides: Override;

    function buildOverrides(secondOverrides: Override[]): Override {
      overrides = mergeOverrides(
        withNoopAppMetadata(),
        ...secondOverrides,
        withMemoryStore(sinon.fake()),
        withConversationContext(sinon.fake.returns(noopMiddleware)),
      );
      return overrides;
    }

    describe('authorize', () => {
      it('should extract valid enterprise_id in a shared channel #935', async () => {
        // Arrange
        const fakeAxiosPost = sinon.fake.resolves({});
        overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
        const MockApp = await importApp(overrides);

        // Act
        let workedAsExpected = false;
        const app = new MockApp({
          receiver: fakeReceiver,
          authorize: async ({ enterpriseId }) => {
            if (enterpriseId !== undefined) {
              throw new Error('the enterprise_id must be undefined in this scenario');
            }
            return dummyAuthorizationResult;
          },
        });
        app.event('message', async () => {
          workedAsExpected = true;
        });
        await fakeReceiver.sendEvent({
          ack: noop,
          body: {
            team_id: 'T_connected_grid_workspace',
            enterprise_id: 'E_org_id',
            api_app_id: 'A111',
            event: {
              type: 'message',
              text: ':wave: Hi, this is my first message in a Slack Connect channel!',
              user: 'U111',
              ts: '1622099033.001500',
              team: 'T_this_non_grid_workspace',
              channel: 'C111',
              channel_type: 'channel',
            },
            type: 'event_callback',
            authorizations: [
              {
                enterprise_id: null,
                team_id: 'T_this_non_grid_workspace',
                user_id: 'U_authed_user',
                is_bot: true,
                is_enterprise_install: false,
              },
            ],
            is_ext_shared_channel: true,
            event_context: '2-message-T_connected_grid_workspace-A111-C111',
          },
        });

        // Assert
        assert.isTrue(workedAsExpected);
      });
      it('should be skipped for tokens_revoked events #674', async () => {
        // Arrange
        const fakeAxiosPost = sinon.fake.resolves({});
        overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
        const MockApp = await importApp(overrides);

        // Act
        let workedAsExpected = false;
        let authorizeCallCount = 0;
        const app = new MockApp({
          receiver: fakeReceiver,
          authorize: async () => {
            authorizeCallCount += 1;
            return {};
          },
        });
        app.event('tokens_revoked', async () => {
          workedAsExpected = true;
        });

        // The authorize must be called for other events
        await fakeReceiver.sendEvent({
          ack: noop,
          body: {
            enterprise_id: 'E_org_id',
            api_app_id: 'A111',
            event: {
              type: 'app_mention',
            },
            type: 'event_callback',
          },
        });
        assert.equal(authorizeCallCount, 1);

        await fakeReceiver.sendEvent({
          ack: noop,
          body: {
            enterprise_id: 'E_org_id',
            api_app_id: 'A111',
            event: {
              type: 'tokens_revoked',
              tokens: {
                oauth: ['P'],
                bot: ['B'],
              },
            },
            type: 'event_callback',
          },
        });

        // Assert
        assert.equal(authorizeCallCount, 1); // still 1
        assert.isTrue(workedAsExpected);
      });
      it('should be skipped for app_uninstalled events #674', async () => {
        // Arrange
        const fakeAxiosPost = sinon.fake.resolves({});
        overrides = buildOverrides([withNoopWebClient(), withAxiosPost(fakeAxiosPost)]);
        const MockApp = await importApp(overrides);

        // Act
        let workedAsExpected = false;
        let authorizeCallCount = 0;
        const app = new MockApp({
          receiver: fakeReceiver,
          authorize: async () => {
            authorizeCallCount += 1;
            return {};
          },
        });
        app.event('app_uninstalled', async () => {
          workedAsExpected = true;
        });

        // The authorize must be called for other events
        await fakeReceiver.sendEvent({
          ack: noop,
          body: {
            enterprise_id: 'E_org_id',
            api_app_id: 'A111',
            event: {
              type: 'app_mention',
            },
            type: 'event_callback',
          },
        });
        assert.equal(authorizeCallCount, 1);

        await fakeReceiver.sendEvent({
          ack: noop,
          body: {
            enterprise_id: 'E_org_id',
            api_app_id: 'A111',
            event: {
              type: 'app_uninstalled',
            },
            type: 'event_callback',
          },
        });

        // Assert
        assert.equal(authorizeCallCount, 1); // still 1
        assert.isTrue(workedAsExpected);
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

function withAxiosPost(spy: SinonSpy): Override {
  return {
    axios: {
      create: () => ({
        post: spy,
      }),
    },
  };
}
