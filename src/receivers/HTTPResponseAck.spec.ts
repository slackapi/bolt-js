import 'mocha';
import sinon from 'sinon';
import { assert } from 'chai';
import { IncomingMessage, ServerResponse } from 'http';
import { HTTPResponseAck } from './HTTPResponseAck';
import { createFakeLogger } from '../test-helpers';

describe('HTTPResponseAck', async () => {
  it('should work', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const ack = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    assert.isDefined(ack);
    assert.isDefined(ack.bind());
    ack.ack(); // no exception
  });
});
