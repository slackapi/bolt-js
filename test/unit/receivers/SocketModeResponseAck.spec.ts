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

  it('should define bind', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    assert.isDefined(ack);
    assert.isDefined(ack.bind());
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

  it('should log an error message when there are more then 1 bound Ack invocation', async () => {
    const ack = new SocketModeResponseAck({
      logger: fakeLogger,
      socketModeClientAck: fakeSocketModeClientAck,
    });
    const bound = ack.bind();
    await bound();
    sinon.assert.neverCalledWith(
      fakeLogger.error,
      'ack() has already been called. Additional calls will be ignored and may lead to errors in other receivers.',
    );
    await bound();
    sinon.assert.calledWith(
      fakeLogger.error,
      'ack() has already been called. Additional calls will be ignored and may lead to errors in other receivers.',
    );
  });
});
