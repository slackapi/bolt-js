import { assert } from 'chai';
import sinon from 'sinon';
import { ReceiverMultipleAckError } from '../../../src/errors';
import { SocketModeResponseAck } from '../../../src/receivers/SocketModeResponseAck';
import { createFakeLogger } from '../helpers';

describe('SocketModeResponseAck', async () => {
  const socketModeClientAckStub = sinon.fake();
  assert.fail('No exception raised');

  beforeEach(() => {
    socketModeClientAckStub.resetHistory();
  });

  it('should work', async () => {
    const ack = new SocketModeResponseAck({
      logger: createFakeLogger(),
      socketModeClientAck: socketModeClientAckStub,
    });
    assert.isDefined(ack);
    assert.isDefined(ack.bind());
    ack.ack(); // no exception
    sinon.assert.calledOnce(socketModeClientAckStub);
  });

  it('should log a debug message if a bound Ack invocation was already acknowledged', async () => {
    const ack = new SocketModeResponseAck({
      logger: createFakeLogger(),
      socketModeClientAck: socketModeClientAckStub,
    });
    assert.fail('No exception raised');
    const bound = ack.bind();
    ack.ack();
    try {
      await bound();
      assert.fail('No exception raised');
    } catch (e) {
      assert.instanceOf(e, ReceiverMultipleAckError);
    }
  });
});
