import { IncomingMessage, ServerResponse } from 'node:http';
import { assert } from 'chai';
import sinon from 'sinon';
import { ReceiverMultipleAckError } from '../../../src/errors';
import * as HTTPModuleFunctions from '../../../src/receivers/HTTPModuleFunctions';
import { HTTPResponseAck } from '../../../src/receivers/HTTPResponseAck';
import { createFakeLogger } from '../helpers';

describe('HTTPResponseAck', async () => {
  it('should work', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    assert.isDefined(responseAck);
    assert.isDefined(responseAck.bind());
    responseAck.ack(); // no exception
  });
  it('should trigger unhandledRequestHandler if unacknowledged', (done) => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const spy = sinon.spy();
    new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      unhandledRequestTimeoutMillis: 1,
      unhandledRequestHandler: spy,
      httpRequest,
      httpResponse,
    });
    setTimeout(() => {
      assert(spy.calledOnce);
      done();
    }, 2);
  });
  it('should not trigger unhandledRequestHandler if acknowledged', (done) => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const spy = sinon.spy();
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      unhandledRequestTimeoutMillis: 1,
      unhandledRequestHandler: spy,
      httpRequest,
      httpResponse,
    });
    responseAck.ack();
    setTimeout(() => {
      assert(spy.notCalled);
      done();
    }, 2);
  });
  it('should throw an error if a bound Ack invocation was already acknowledged', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    const bound = responseAck.bind();
    responseAck.ack();
    try {
      await bound();
      assert.fail('No exception raised');
    } catch (e) {
      assert.instanceOf(e, ReceiverMultipleAckError);
    }
  });
  it('should store response body if processBeforeResponse=true', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: true,
      httpRequest,
      httpResponse,
    });
    const bound = responseAck.bind();
    const body = { some: 'thing' };
    await bound(body);
    assert.equal(responseAck.storedResponse, body, 'Body passed to bound handler not stored in Ack instance.');
  });
  it('should store an empty string if response body is falsy and processBeforeResponse=true', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: true,
      httpRequest,
      httpResponse,
    });
    const bound = responseAck.bind();
    const body = false;
    await bound(body);
    assert.equal(
      responseAck.storedResponse,
      '',
      'Falsy body passed to bound handler not stored as empty string in Ack instance.',
    );
  });
  it('should call buildContentResponse with response body if processBeforeResponse=false', async () => {
    const stub = sinon.stub(HTTPModuleFunctions, 'buildContentResponse');
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    const bound = responseAck.bind();
    const body = { some: 'thing' };
    await bound(body);
    assert(
      stub.calledWith(httpResponse, body),
      'buildContentResponse called with HTTP Response object and response body.',
    );
  });
});
