import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import { expectType } from 'tsd';
import { SocketModeResponseAck } from '../../../src/receivers/SocketModeResponseAck';
import type { ResponseAck } from '../../../src/types';
import { createFakeLogger, type MockFn } from '../helpers';

describe('SocketModeResponseAck', async () => {
  const fakeSocketModeClientAck: MockFn = mock.fn();
  const fakeLogger = createFakeLogger();

  beforeEach(() => {
    fakeSocketModeClientAck.mock.resetCalls();
    fakeLogger.warn.mock.resetCalls();
  });

  it('should implement ResponseAck', async () => {
    const responseAck = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    assert.ok(responseAck !== undefined);
    assert.ok(responseAck.bind() !== undefined);
    expectType<ResponseAck>(responseAck);
  });

  describe('bind', async () => {
    it('should create bound Ack that invoke the response to the request', async () => {
      const responseAck = new SocketModeResponseAck({
        logger: fakeLogger,
        socketModeClientAck: fakeSocketModeClientAck,
      });
      const ack = responseAck.bind();
      await ack(); // no exception
      assert.strictEqual(fakeSocketModeClientAck.mock.callCount(), 1);
    });

    it('should log an error message when there are more then 1 bound Ack invocation', async () => {
      const responseAck = new SocketModeResponseAck({
        logger: fakeLogger,
        socketModeClientAck: fakeSocketModeClientAck,
      });
      const ack = responseAck.bind();
      await ack();
      assert.ok(
        !fakeLogger.warn.mock.calls.some(
          (call) =>
            call.arguments[0] ===
            'ack() has already been called. Additional calls will be ignored and may lead to errors in other receivers.',
        ),
      );
      await ack();
      assert.ok(
        fakeLogger.warn.mock.calls.some(
          (call) =>
            call.arguments[0] ===
            'ack() has already been called. Additional calls will be ignored and may lead to errors in other receivers.',
        ),
      );
    });
  });
});
