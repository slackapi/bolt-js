import { assert } from 'chai';
import sinon from 'sinon';
import { SocketModeResponseAck } from '../../../src/receivers/SocketModeResponseAck';
import { createFakeLogger } from '../helpers';

describe('SocketModeResponseAck', async () => {
  const fakeSocketModeClientAck = sinon.fake();
  const fakeLogger = createFakeLogger();

  beforeEach(() => {
    fakeSocketModeClientAck.resetHistory();
    fakeLogger.debug.reset();
    fakeLogger.error.reset();
  });

  it('should work', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    assert.isDefined(ack);
    assert.isDefined(ack.bind());
    ack.ack(); // no exception
    sinon.assert.calledOnce(fakeSocketModeClientAck);
  });

  it('should log a debug message if a bound Ack invocation was already acknowledged', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    const bound = ack.bind();
    ack.ack();
    await bound();
    sinon.assert.calledWith(fakeLogger.debug, 'ack() has already been called; subsequent calls have no effect');
  });
});
