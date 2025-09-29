import type http from 'http';

import type { EndRequest } from '@algolia/client-common';
import type { MockRequest, MockResponse } from 'xhr-mock';
import mock from 'xhr-mock';

import { createXhrRequester } from '../..';
import {
  BASE_URL,
  headers,
  timeoutRequest,
  requestStub,
  getStringifiedBody,
  createTestServer,
} from '../../../../tests/utils';

const requester = createXhrRequester();

describe('status code handling', () => {
  beforeEach(() => mock.setup());
  afterEach(() => mock.teardown());

  it('sends requests', async () => {
    mock.post(BASE_URL, (req: MockRequest, res: MockResponse): MockResponse => {
      expect(req.method()).toEqual('POST');
      expect(req.header('content-type')).toEqual('text/plain');
      expect(req.body()).toEqual(JSON.stringify({ foo: 'bar' }));

      return res.status(200);
    });

    await requester.send(requestStub);
  });

  it('resolves status 200', async () => {
    const body = getStringifiedBody();

    mock.post(BASE_URL, {
      status: 200,
      body: requestStub.data,
    });

    const response = await requester.send(requestStub);

    expect(response.status).toBe(200);
    expect(response.content).toBe(body);
    expect(response.isTimedOut).toBe(false);
  });

  it('resolves status 300', async () => {
    const reason = 'Multiple Choices';

    mock.post(BASE_URL, {
      status: 300,
      reason,
    });

    const response = await requester.send(requestStub);

    expect(response.status).toBe(300);
    expect(response.content).toBe(''); // No body returned here on xhr
    expect(response.isTimedOut).toBe(false);
  });

  it('resolves status 400', async () => {
    const body = getStringifiedBody({
      message: 'Invalid Application-Id or API-Key',
    });

    mock.post(BASE_URL, {
      status: 400,
      body,
    });

    const response = await requester.send(requestStub);

    expect(response.status).toBe(400);
    expect(response.content).toBe(body);
    expect(response.isTimedOut).toBe(false);
  });

  it('handles the protocol', async () => {
    const body = getStringifiedBody();

    mock.post('http://localhost/', {
      status: 200,
      body,
    });

    const response = await requester.send({
      ...requestStub,
      url: 'http://localhost',
    });

    expect(response.status).toBe(200);
    expect(response.content).toBe(body);
    expect(response.isTimedOut).toBe(false);
  });
});

describe('timeout handling', () => {
  let server: http.Server;
  // setup http server to test timeout
  beforeAll(() => {
    server = createTestServer();

    server.listen('1111');
  });

  afterAll((done) => {
    server.close(() => done());
  });

  it('connection timeouts with the given 1 seconds connection timeout', async () => {
    const before = Date.now();
    const response = await requester.send({
      ...timeoutRequest,
      connectTimeout: 1000,
      url: 'http://localhost:1111/connection_timeout',
    });

    const now = Date.now();

    expect(response.content).toBe('Connection timeout');
    expect(now - before).toBeGreaterThanOrEqual(999);
    expect(now - before).toBeLessThanOrEqual(1200);
  });

  it('connection timeouts with the given 2 seconds connection timeout', async () => {
    const before = Date.now();
    const response = await requester.send({
      ...timeoutRequest,
      connectTimeout: 2000,
      url: 'http://localhost:1111/connection_timeout',
    });

    const now = Date.now();

    expect(response.content).toBe('Connection timeout');
    expect(now - before).toBeGreaterThanOrEqual(1990);
    expect(now - before).toBeLessThanOrEqual(2200);
  });

  it("socket timeouts if response don't appears before the timeout with 2 seconds timeout", async () => {
    const before = Date.now();

    const response = await requester.send({
      ...timeoutRequest,
      responseTimeout: 2000,
      url: 'http://localhost:1111',
    });

    const now = Date.now();

    expect(response.content).toBe('Socket timeout');
    expect(now - before).toBeGreaterThanOrEqual(1990);
    expect(now - before).toBeLessThanOrEqual(2200);
  });

  it("socket timeouts if response don't appears before the timeout with 3 seconds timeout", async () => {
    const before = Date.now();

    const response = await requester.send({
      ...timeoutRequest,
      responseTimeout: 3000,
      url: 'http://localhost:1111',
    });

    const now = Date.now();

    expect(response.content).toBe('Socket timeout');
    expect(now - before).toBeGreaterThanOrEqual(2999);
    expect(now - before).toBeLessThanOrEqual(3200);
  });

  it('do not timeouts if response appears before the timeout', async () => {
    const before = Date.now();
    const response = await requester.send({
      ...requestStub,
      responseTimeout: 6000,
      url: 'http://localhost:1111',
    });

    const now = Date.now();

    expect(response.isTimedOut).toBe(false);
    expect(response.status).toBe(200);
    expect(response.content).toBe('{"foo": "bar"}');
    expect(now - before).toBeGreaterThanOrEqual(4999);
    expect(now - before).toBeLessThanOrEqual(5200);
  }, 10000); // This is a long-running test, default server timeout is set to 5000ms
});

describe('error handling', () => {
  it('resolves dns not found', async () => {
    const request: EndRequest = {
      url: 'https://this-dont-exist.algolia.com',
      method: 'POST',
      headers,
      data: getStringifiedBody(),
      responseTimeout: 2000,
      connectTimeout: 1000,
    };

    const response = await requester.send(request);

    expect(response.status).toBe(0);
    expect(response.content).toBe('Network request failed');
    expect(response.isTimedOut).toBe(false);
  });

  it('resolves general network errors', async () => {
    mock.post(BASE_URL, () => Promise.reject(new Error('This is a general error')));

    const response = await requester.send(requestStub);

    expect(response.status).toBe(0);
    expect(response.content).toBe('Network request failed');
    expect(response.isTimedOut).toBe(false);
  });
});
