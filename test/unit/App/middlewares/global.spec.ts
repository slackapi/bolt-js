import type { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../../src/App';
import type { ExtendedErrorHandlerArgs } from '../../../../src/App';
import { AuthorizationError, type CodedError, ErrorCode, UnknownError } from '../../../../src/errors';
import type { NextFn, ReceiverEvent } from '../../../../src/types';
import {
  FakeReceiver,
  createDummyCustomFunctionMiddlewareArgs,
  createDummyReceiverEvent,
  createFakeLogger,
  delay,
  importApp,
  mergeOverrides,
  noop,
  noopMiddleware,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../../helpers';

describe('App global middleware Processing', () => {
  let fakeReceiver: FakeReceiver;
  let fakeErrorHandler: SinonSpy;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let fakeFirstMiddleware: SinonSpy;
  let fakeSecondMiddleware: SinonSpy;
  let app: App;
  let dummyReceiverEvent: ReceiverEvent;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeErrorHandler = sinon.fake();
    dummyAuthorizationResult = { botToken: '', botId: '' };

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

  // TODO: verify that authorize callback is called with the correct properties and responds correctly to
  // various return values

  function createInvalidReceiverEvents(): ReceiverEvent[] {
    // TODO: create many more invalid receiver events (fuzzing)
    return [
      {
        body: {},
        ack: sinon.fake(),
      },
    ];
  }

  it('should warn and skip when processing a receiver event with unknown type (never crash)', async () => {
    const fakeLogger = createFakeLogger();
    const fakeMiddleware = sinon.fake(noopMiddleware);
    const invalidReceiverEvents = createInvalidReceiverEvents();
    const MockApp = await importApp();

    const app = new MockApp({ receiver: fakeReceiver, logger: fakeLogger, authorize: sinon.fake() });
    app.use(fakeMiddleware);
    await Promise.all(invalidReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

    assert(fakeErrorHandler.notCalled);
    assert(fakeMiddleware.notCalled);
    assert.isAtLeast(fakeLogger.warn.callCount, invalidReceiverEvents.length);
  });

  it('should warn, send to global error handler, and skip when a receiver event fails authorization', async () => {
    const fakeLogger = createFakeLogger();
    const fakeMiddleware = sinon.fake(noopMiddleware);
    const dummyOrigError = new Error('auth failed');
    const dummyAuthorizationError = new AuthorizationError('auth failed', dummyOrigError);
    const dummyReceiverEvent = createDummyReceiverEvent();
    const MockApp = await importApp();

    const app = new MockApp({
      receiver: fakeReceiver,
      logger: fakeLogger,
      authorize: sinon.fake.rejects(dummyAuthorizationError),
    });
    app.use(fakeMiddleware);
    app.error(fakeErrorHandler);
    await fakeReceiver.sendEvent(dummyReceiverEvent);

    assert(fakeMiddleware.notCalled);
    assert(fakeLogger.warn.called);
    assert.instanceOf(fakeErrorHandler.firstCall.args[0], Error);
    assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'code', ErrorCode.AuthorizationError);
    assert.propertyVal(fakeErrorHandler.firstCall.args[0], 'original', dummyAuthorizationError.original);
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
    // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
    let caughtError: any;

    app.use(async ({ next }) => {
      try {
        await next();
      } catch (err) {
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
    const assertOrderMiddleware =
      (orderDown: number, orderUp: number) =>
      async ({ next }: { next?: NextFn }) => {
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
    // biome-ignore lint/complexity/useLiteralKeys: Accessing through bracket notation because it is private (for testing purposes)
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

    // biome-ignore lint/complexity/useLiteralKeys: Accessing through bracket notation because it is private (for testing purposes)
    app['extendedErrorHandler'] = false;
  });

  it('with a default global error handler, rejects App#ProcessEvent', async () => {
    const error = new Error('The worst has happened, bot is beyond saving, always hug servers');
    // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
    let actualError: any;

    app.use(() => {
      throw error;
    });

    try {
      await fakeReceiver.sendEvent(dummyReceiverEvent);
    } catch (err) {
      actualError = err;
    }

    assert.instanceOf(actualError, UnknownError);
    assert.equal(actualError.message, error.message);
  });

  it('should use the xwfp token if the request contains one', async () => {
    const MockApp = await importApp();
    const app = new MockApp({
      receiver: fakeReceiver,
      authorize: noop,
    });

    let clientArg: WebClient | undefined;
    app.use(async ({ client }) => {
      clientArg = client;
    });
    const testData = createDummyCustomFunctionMiddlewareArgs({ options: { autoAcknowledge: false } });
    await fakeReceiver.sendEvent({ ack: testData.ack, body: testData.body });

    assert.notTypeOf(clientArg, 'undefined');
    assert.equal(clientArg?.token, 'xwfp-valid');
  });

  it('should not use xwfp token if the request contains one and attachFunctionToken is false', async () => {
    const MockApp = await importApp();
    const app = new MockApp({
      receiver: fakeReceiver,
      authorize: noop,
      attachFunctionToken: false,
    });

    let clientArg: WebClient | undefined;
    app.use(async ({ client }) => {
      clientArg = client;
    });
    const testData = createDummyCustomFunctionMiddlewareArgs({ options: { autoAcknowledge: false } });
    await fakeReceiver.sendEvent({ ack: testData.ack, body: testData.body });

    assert.notTypeOf(clientArg, 'undefined');
    assert.equal(clientArg?.token, undefined);
  });
});
