import { assert } from 'chai';
import sinon from 'sinon';
import { expectType } from 'tsd';
import { SocketModeResponseAck } from '../../../src/receivers/SocketModeResponseAck';
import type { ResponseAck } from '../../../src/types';
import { createFakeLogger } from '../helpers';

describe('SocketModeResponseAck', async () => {
  const fakeSocketModeClientAck = sinon.fake();
  const fakeLogger = createFakeLogger();

  beforeEach(() => {
    sinon.reset();
  });

  it('should implement ResponseAck', async () => {
    const responseAck = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    assert.isDefined(responseAck);
    assert.isDefined(responseAck.bind());
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
      sinon.assert.calledOnce(fakeSocketModeClientAck);
    });

    it('should log an error message when there are more then 1 bound Ack invocation', async () => {
      const responseAck = new SocketModeResponseAck({
        logger: fakeLogger,
        socketModeClientAck: fakeSocketModeClientAck,
      });
      const ack = responseAck.bind();
      await ack();
      sinon.assert.neverCalledWith(
        fakeLogger.warn,
        'ack() has already been called. Additional calls will be ignored and may lead to errors in other receivers.',
      );
      await ack();
      sinon.assert.calledWith(
        fakeLogger.warn,
        'ack() has already been called. Additional calls will be ignored and may lead to errors in other receivers.',
      );
    });
  });
});
