import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import type { WebClient } from '@slack/web-api';
import type App from '../../../../src/App';
import type { ExtendedErrorHandlerArgs } from '../../../../src/App';
import { AuthorizationError, type CodedError, ErrorCode, UnknownError } from '../../../../src/errors';
import type { NextFn, ReceiverEvent } from '../../../../src/types';
import {
  createDummyCustomFunctionMiddlewareArgs,
  createDummyReceiverEvent,
  createFakeLogger,
  delay,
  FakeReceiver,
  importApp,
  type MockFn,
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
  let fakeErrorHandler: MockFn;
  let dummyAuthorizationResult: { botToken: string; botId: string };
  let fakeFirstMiddleware: MockFn;
  let fakeSecondMiddleware: MockFn;
  const fakeAck: MockFn = mock.fn(() => Promise.resolve({}));
  let app: App;
  let dummyReceiverEvent: ReceiverEvent;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeErrorHandler = mock.fn();
    dummyAuthorizationResult = { botToken: '', botId: '' };
    fakeAck.mock.resetCalls();

    const fakeConversationContext = mock.fn(() => noopMiddleware);
    const overrides = mergeOverrides(
      withNoopAppMetadata(),
      withNoopWebClient(),
      withMemoryStore(mock.fn()),
      withConversationContext(fakeConversationContext),
    );
    const MockApp = importApp(overrides);

    dummyReceiverEvent = createDummyReceiverEvent();
    fakeFirstMiddleware = mock.fn(noopMiddleware);
    fakeSecondMiddleware = mock.fn(noopMiddleware);

    app = new MockApp({
      logger: createFakeLogger(),
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve(dummyAuthorizationResult)),
    });
  });

  // TODO: verify that authorize callback is called with the correct properties and responds correctly to
  // various return values

  function createInvalidReceiverEvents(): ReceiverEvent[] {
    // TODO: create many more invalid receiver events (fuzzing)
    return [
      {
        body: {},
        ack: fakeAck,
      },
    ];
  }

  it('should warn and skip when processing a receiver event with unknown type (never crash)', async () => {
    const fakeLogger = createFakeLogger();
    const fakeMiddleware = mock.fn(noopMiddleware);
    const invalidReceiverEvents = createInvalidReceiverEvents();
    const MockApp = importApp();

    const app = new MockApp({ receiver: fakeReceiver, logger: fakeLogger, authorize: noop });
    app.use(fakeMiddleware);
    await Promise.all(invalidReceiverEvents.map((event) => fakeReceiver.sendEvent(event)));

    assert.strictEqual(fakeErrorHandler.mock.callCount(), 0);
    assert.strictEqual(fakeMiddleware.mock.callCount(), 0);
    assert.ok(fakeLogger.warn.mock.callCount() >= invalidReceiverEvents.length);
  });

  it('should warn, send to global error handler, acknowledge, and skip when a receiver event fails authorization', async () => {
    const fakeLogger = createFakeLogger();
    const fakeMiddleware = mock.fn(noopMiddleware);
    const dummyOrigError = new Error('auth failed');
    const dummyAuthorizationError = new AuthorizationError('auth failed', dummyOrigError);
    const dummyReceiverEvent = createDummyReceiverEvent();
    const MockApp = importApp();

    const app = new MockApp({
      receiver: fakeReceiver,
      logger: fakeLogger,
      authorize: mock.fn(() => Promise.reject(dummyAuthorizationError)),
    });
    app.use(fakeMiddleware);
    app.error(fakeErrorHandler);
    await fakeReceiver.sendEvent({ ...dummyReceiverEvent, ack: fakeAck });

    assert.strictEqual(fakeMiddleware.mock.callCount(), 0);
    assert.ok(fakeLogger.warn.mock.callCount() > 0);
    assert.ok(fakeErrorHandler.mock.calls[0].arguments[0] instanceof AuthorizationError);
    assert.strictEqual(fakeErrorHandler.mock.calls[0].arguments[0].code, ErrorCode.AuthorizationError);
    assert.strictEqual(fakeErrorHandler.mock.calls[0].arguments[0].original, dummyAuthorizationError);
    assert.ok(fakeAck.mock.callCount() > 0);
  });

  it('should preserve a non-Error authorization rejection via the original error cause', async () => {
    const fakeLogger = createFakeLogger();
    const dummyRejection = { code: 'no_install', teamId: 'T-non-error' };
    const dummyReceiverEvent = createDummyReceiverEvent();
    const MockApp = importApp();

    const app = new MockApp({
      receiver: fakeReceiver,
      logger: fakeLogger,
      authorize: () => Promise.reject(dummyRejection),
    });
    app.error(fakeErrorHandler);
    await fakeReceiver.sendEvent({ ...dummyReceiverEvent, ack: fakeAck });

    assert.ok(fakeErrorHandler.mock.calls[0].arguments[0] instanceof AuthorizationError);
    assert.strictEqual(fakeErrorHandler.mock.calls[0].arguments[0].original.cause, dummyRejection);
    assert.ok(fakeAck.mock.callCount() > 0);
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
    assert.ok(fakeErrorHandler.mock.calls[0].arguments[0] instanceof Error);
  });

  it('correctly waits for async listeners', async () => {
    let changed = false;

    app.use(async ({ next }) => {
      await delay(10);
      changed = true;

      await next();
    });

    await fakeReceiver.sendEvent(dummyReceiverEvent);
    assert.ok(changed);
    assert.strictEqual(fakeErrorHandler.mock.callCount(), 0);
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
    assert.strictEqual(fakeErrorHandler.mock.callCount(), 0);
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
    assert.strictEqual(fakeErrorHandler.mock.callCount(), 0);
  });

  it('should, on error, call the global error handler, not extended', async () => {
    const error = new Error('Everything is broke, you probably should restart, if not then good luck');

    app.use(() => {
      throw error;
    });

    app.error(async (codedError: CodedError) => {
      assert.ok(codedError instanceof UnknownError);
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
      assert.ok('error' in args);
      assert.ok('body' in args);
      assert.ok('context' in args);
      assert.ok('logger' in args);
      assert.ok(args.error !== undefined);
      assert.ok(args.body !== undefined);
      assert.ok(args.context !== undefined);
      assert.ok(args.logger !== undefined);
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

    assert.ok(actualError instanceof UnknownError);
    assert.equal(actualError.message, error.message);
  });

  it('should use the xwfp token if the request contains one', async () => {
    const MockApp = importApp();
    const app = new MockApp({
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve({})),
    });

    let clientArg: WebClient | undefined;
    app.use(async ({ client }) => {
      clientArg = client;
    });
    const testData = createDummyCustomFunctionMiddlewareArgs({ options: { autoAcknowledge: false } });
    await fakeReceiver.sendEvent({ ack: fakeAck, body: testData.body });

    assert.ok(clientArg !== undefined);
    assert.equal(clientArg.token, 'xwfp-valid');
  });

  it('should not use xwfp token if the request contains one and attachFunctionToken is false', async () => {
    const MockApp = importApp();
    const app = new MockApp({
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve({})),
      attachFunctionToken: false,
    });

    let clientArg: WebClient | undefined;
    app.use(async ({ client }) => {
      clientArg = client;
    });
    const testData = createDummyCustomFunctionMiddlewareArgs({ options: { autoAcknowledge: false } });
    await fakeReceiver.sendEvent({ ack: fakeAck, body: testData.body });

    assert.ok(clientArg !== undefined);
    assert.equal(clientArg.token, undefined);
  });

  it('should use the xwfp token if the request contains one and not reuse it in following requests', async () => {
    const MockApp = importApp();
    // App adds the first event's teamId to this shared result, which the second event's client lookup uses
    const authorizeResult = { botToken: 'xoxb-valid' };
    const app = new MockApp({
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve(authorizeResult)),
    });

    let clientArg: WebClient | undefined;
    app.use(async ({ client }) => {
      clientArg = client;
    });
    const testData = createDummyCustomFunctionMiddlewareArgs({ options: { autoAcknowledge: false } });
    await fakeReceiver.sendEvent({ ack: fakeAck, body: testData.body });

    assert.ok(clientArg !== undefined);
    assert.equal(clientArg.token, 'xwfp-valid');

    await fakeReceiver.sendEvent(dummyReceiverEvent);
    assert.ok(clientArg !== undefined);
    assert.equal(clientArg.token, 'xoxb-valid');
  });
});
