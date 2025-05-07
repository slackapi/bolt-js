import { assert } from 'chai';
import sinon from 'sinon';
import { SocketModeResponseAck } from '../../../src/receivers/SocketModeResponseAck';
import { createFakeLogger } from '../helpers';

describe('SocketModeResponseAck', async () => {
  const fakeSocketModeClientAck = sinon.fake();
  const fakeLogger = createFakeLogger();

  beforeEach(() => {
    sinon.reset();
  });

  it('should work', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    assert.isDefined(ack);
    assert.isDefined(ack.bind());
    await ack.ack(); // no exception
    sinon.assert.calledOnce(fakeSocketModeClientAck);
  });

  it('bound Ack invocation should work', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    const bound = ack.bind();
    await bound(); // no exception
    sinon.assert.calledOnce(fakeSocketModeClientAck);
  });

  it('should log a debug message if a bound Ack invocation was already acknowledged', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    const bound = ack.bind();
    await ack.ack();
    await bound();
    sinon.assert.calledWith(fakeLogger.warn, 'ack() has already been invoked; subsequent calls have no effect');
  });

  it('should log a debug message when there are more then 1 bound Ack invocation', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    const bound = ack.bind();
    await bound();
    sinon.assert.neverCalledWith(fakeLogger.warn, 'ack() has already been invoked; subsequent calls have no effect');
    await bound();
    sinon.assert.calledWith(fakeLogger.warn, 'ack() has already been invoked; subsequent calls have no effect');
  });

  it('should allow more then 1 direct ack() invocation', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    await ack.ack({});
    sinon.assert.calledWith(fakeLogger.debug, 'ack() response sent (body: {})');
    await ack.ack();
    sinon.assert.calledWith(fakeLogger.debug, 'ack() response sent (body: undefined)');
  });
});
