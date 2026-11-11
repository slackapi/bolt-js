import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { WebAPIHTTPError, WebAPIPlatformError, WebAPIRateLimitedError } from '@slack/web-api';
import type App from '../../../src/App';
import type { ReceiverEvent } from '../../../src/types';
import {
  createDummyReceiverEvent,
  createFakeLogger,
  FakeReceiver,
  importApp,
  mergeOverrides,
  noopMiddleware,
  withConversationContext,
  withMemoryStore,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../helpers';

const overrides = mergeOverrides(
  withNoopAppMetadata(),
  withNoopWebClient(),
  withMemoryStore(mock.fn()),
  withConversationContext(mock.fn(() => noopMiddleware)),
);

describe('App default error handler', () => {
  let fakeReceiver: FakeReceiver;
  let dummyReceiverEvent: ReceiverEvent;
  let app: App;
  let fakeLogger: ReturnType<typeof createFakeLogger>;

  beforeEach(async () => {
    fakeReceiver = new FakeReceiver();
    fakeLogger = createFakeLogger();
    dummyReceiverEvent = createDummyReceiverEvent();

    const MockApp = importApp(overrides);
    app = new MockApp({
      logger: fakeLogger,
      receiver: fakeReceiver,
      authorize: mock.fn(() => Promise.resolve({ botToken: '', botId: '' })),
    });
  });

  it('should log a formatted message for WebAPIPlatformError', async () => {
    app.use(() => {
      throw new WebAPIPlatformError({ ok: false, error: 'channel_not_found' });
    });

    try {
      await fakeReceiver.sendEvent(dummyReceiverEvent);
      assert.fail('should have thrown');
    } catch (thrown) {
      assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
      assert.strictEqual(fakeLogger.error.mock.calls[0].arguments[0], 'Slack API error: channel_not_found');
      assert.strictEqual(fakeLogger.error.mock.calls[0].arguments[1], thrown);
    }
  });

  it('should log a formatted message for WebAPIRateLimitedError', async () => {
    app.use(() => {
      throw new WebAPIRateLimitedError(30);
    });

    try {
      await fakeReceiver.sendEvent(dummyReceiverEvent);
      assert.fail('should have thrown');
    } catch (thrown) {
      assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
      assert.strictEqual(fakeLogger.error.mock.calls[0].arguments[0], 'Rate limited, retry after 30s');
      assert.strictEqual(fakeLogger.error.mock.calls[0].arguments[1], thrown);
    }
  });

  it('should log a formatted message for WebAPIHTTPError', async () => {
    app.use(() => {
      throw new WebAPIHTTPError(500, 'Internal Server Error', {}, '');
    });

    try {
      await fakeReceiver.sendEvent(dummyReceiverEvent);
      assert.fail('should have thrown');
    } catch (thrown) {
      assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
      assert.strictEqual(fakeLogger.error.mock.calls[0].arguments[0], 'HTTP error 500: Internal Server Error');
      assert.strictEqual(fakeLogger.error.mock.calls[0].arguments[1], thrown);
    }
  });

  it('should log the raw error for unknown error types', async () => {
    app.use(() => {
      throw new Error('something unexpected');
    });

    try {
      await fakeReceiver.sendEvent(dummyReceiverEvent);
      assert.fail('should have thrown');
    } catch (_) {
      assert.strictEqual(fakeLogger.error.mock.callCount(), 1);
      const loggedArg = fakeLogger.error.mock.calls[0].arguments[0];
      assert.ok('code' in loggedArg);
      assert.strictEqual(loggedArg.message, 'something unexpected');
    }
  });
});
