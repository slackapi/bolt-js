import assert from 'node:assert/strict';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { expectType } from 'tsd';
import { ReceiverMultipleAckError } from '../../../src/errors';
import { HTTPResponseAck } from '../../../src/receivers/HTTPResponseAck';
import type { ResponseAck } from '../../../src/types';
import { createFakeLogger, type MockFn, mockInstance, type Override, proxyquire } from '../helpers';

function importHTTPResponseAck(
  overrides: Override = {},
): typeof import('../../../src/receivers/HTTPResponseAck').HTTPResponseAck {
  const absolutePath = path.resolve(__dirname, '../../../src/receivers/HTTPResponseAck');
  return proxyquire(absolutePath, overrides).HTTPResponseAck;
}

describe('HTTPResponseAck', async () => {
  let setTimeoutSpy: MockFn;

  beforeEach(() => {
    setTimeoutSpy = mock.method(global, 'setTimeout');
  });

  afterEach(() => {
    if (setTimeoutSpy) {
      setTimeoutSpy.mock.restore();
    }
  });

  it('should implement ResponseAck and work', async () => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    assert.ok(responseAck !== undefined);
    assert.ok(responseAck.bind() !== undefined);
    expectType<ResponseAck>(responseAck);
    responseAck.ack(); // no exception
  });
  it('should set the unhandled request handler to execute after 3 seconds', async () => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    responseAck.ack(); // no exception
    assert(setTimeoutSpy.mock.callCount() === 1, 'unhandledRequestHandler is set as a timeout callback exactly once');
    assert.equal(
      setTimeoutSpy.mock.calls[0].arguments[1],
      3001,
      'a 3 seconds timeout for the unhandledRequestHandler callback is expected',
    );
  });
  it('should trigger unhandledRequestHandler if unacknowledged', (_t, done) => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
    const unhandledRequestTimeoutMillis = 1;
    const spy = mock.fn();
    new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      unhandledRequestTimeoutMillis,
      unhandledRequestHandler: spy,
      httpRequest,
      httpResponse,
    });
    assert.equal(
      setTimeoutSpy.mock.calls[0].arguments[1],
      unhandledRequestTimeoutMillis,
      `a ${unhandledRequestTimeoutMillis} timeout for the unhandledRequestHandler callback is expected`,
    );
    setTimeout(() => {
      assert.strictEqual(spy.mock.callCount(), 1);
      done();
    }, 2);
  });
  it('should not trigger unhandledRequestHandler if acknowledged', (_t, done) => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
    const spy = mock.fn();
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
      assert.strictEqual(spy.mock.callCount(), 0);
      done();
    }, 2);
  });
  it('should throw an error if a bound Ack invocation was already acknowledged', async () => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
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
      assert.ok(e instanceof ReceiverMultipleAckError);
    }
  });
  it('should store response body if processBeforeResponse=true', async () => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
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
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
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
    const stub = mock.fn();
    const HTTPResponseAckWithStub = importHTTPResponseAck({ './HTTPModuleFunctions': { buildContentResponse: stub } });
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAckWithStub({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpResponse,
    });
    const bound = responseAck.bind();
    const body = { some: 'thing' };
    await bound(body);
    assert.deepStrictEqual(
      stub.mock.calls[0].arguments.slice(0, 2),
      [httpResponse, body],
      'buildContentResponse called with HTTP Response object and response body.',
    );
  });
  it('should use extended timeout when handling function_executed events', async () => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpRequestBody: { event: { type: 'function_executed' } },
      httpResponse,
    });
    responseAck.ack(); // no exception
    assert.equal(
      setTimeoutSpy.mock.calls[0].arguments[1],
      5001,
      'a 5 second timeout for the unhandledRequestHandler callback is expected',
    );
  });
  it('should not use extended timeout, when the httpRequestBody is malformed', async () => {
    const httpRequest = mockInstance(IncomingMessage) as IncomingMessage;
    const httpResponse: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
    const responseAck = new HTTPResponseAck({
      logger: createFakeLogger(),
      processBeforeResponse: false,
      httpRequest,
      httpRequestBody: { event: 'a string should not break this' },
      httpResponse,
    });
    responseAck.ack(); // no exception
    assert.equal(
      setTimeoutSpy.mock.calls[0].arguments[1],
      3001,
      'a 3 second timeout for the unhandledRequestHandler callback is expected',
    );
  });
});
