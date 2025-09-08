import { IncomingMessage, ServerResponse } from 'node:http';
import { assert } from 'chai';
import sinon from 'sinon';
import { expectType } from 'tsd';
import { ReceiverMultipleAckError } from '../../../src/errors';
import * as HTTPModuleFunctions from '../../../src/receivers/HTTPModuleFunctions';
import { HTTPResponseAck } from '../../../src/receivers/HTTPResponseAck';
import type { ResponseAck } from '../../../src/types';
import { createFakeLogger } from '../helpers';

describe('HTTPResponseAck', async () => {
  let setTimeoutSpy: sinon.SinonSpy;

  beforeEach(() => {
    setTimeoutSpy = sinon.spy(global, 'setTimeout');
  });

  afterEach(() => {
    if (setTimeoutSpy) {
      setTimeoutSpy.restore();
    }
  });

  it('should implement ResponseAck and work', async () => {
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
    expectType<ResponseAck>(responseAck);
    responseAck.ack(); // no exception
  });
  it('should set the unhandled request handler to execute after 3 seconds', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    responseAck.ack(); // no exception
    assert(setTimeoutSpy.calledOnce, 'unhandledRequestHandler is set as a timeout callback exactly once');
    assert.equal(
      setTimeoutSpy.firstCall.args[1],
      3001,
      'a 3 seconds timeout for the unhandledRequestHandler callback is expected',
    );
  });
  it('should trigger unhandledRequestHandler if unacknowledged', (done) => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const unhandledRequestTimeoutMillis = 1;
    const spy = sinon.spy();
    new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      unhandledRequestTimeoutMillis,
      unhandledRequestHandler: spy,
      httpRequest,
      httpResponse,
    });
    assert.equal(
      setTimeoutSpy.firstCall.args[1],
      unhandledRequestTimeoutMillis,
      `a ${unhandledRequestTimeoutMillis} timeout for the unhandledRequestHandler callback is expected`,
    );
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
  it('should use extended timeout when handling function_executed events', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpRequestBody: { event: { type: 'function_executed' } },
      httpResponse,
    });
    responseAck.ack(); // no exception
    assert.equal(
      setTimeoutSpy.firstCall.args[1],
      5001,
      'a 5 second timeout for the unhandledRequestHandler callback is expected',
    );
  });
  it('should not use extended timeout, when the httpRequestBody is malformed', async () => {
    const httpRequest = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpRequestBody: { event: 'a string should not break this' },
      httpResponse,
    });
    responseAck.ack(); // no exception
    assert.equal(
      setTimeoutSpy.firstCall.args[1],
      3001,
      'a 3 second timeout for the unhandledRequestHandler callback is expected',
    );
  });
});
