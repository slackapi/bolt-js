import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import { describe, it } from 'node:test';

import { AuthorizationError, HTTPReceiverDeferredRequestError, ReceiverMultipleAckError } from '../../../src/errors';
import type { BufferedIncomingMessage } from '../../../src/receivers/BufferedIncomingMessage';
import * as func from '../../../src/receivers/HTTPModuleFunctions';
import { createFakeLogger, mockInstance } from '../helpers';

// Build a real readable request stream so raw-body actually consumes bytes. The other tests in this
// file pre-set `rawBody` and bypass the stream read, so they can't exercise the size-limit behavior.
function streamOf(body: string, headers: Record<string, unknown> = {}): IncomingMessage {
  const req = new Readable();
  req.push(body);
  req.push(null); // indicate EOF
  // biome-ignore lint/suspicious/noExplicitAny: mock requests can be anything
  (req as Record<string, any>).headers = headers;
  return req as unknown as IncomingMessage;
}

describe('HTTPModuleFunctions', async () => {
  describe('Request header extraction', async () => {
    describe('extractRetryNumFromHTTPRequest', async () => {
      it('should work when the header does not exist', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        const result = func.extractRetryNumFromHTTPRequest(req);
        assert.strictEqual(result, undefined);
      });
      it('should parse a single value header', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        req.headers['x-slack-retry-num'] = '2';
        const result = func.extractRetryNumFromHTTPRequest(req);
        assert.equal(result, 2);
      });
      it('should parse an array of value headers', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        req.headers['x-slack-retry-num'] = ['2'];
        const result = func.extractRetryNumFromHTTPRequest(req);
        assert.equal(result, 2);
      });
    });
    describe('extractRetryReasonFromHTTPRequest', async () => {
      it('should work when the header does not exist', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        const result = func.extractRetryReasonFromHTTPRequest(req);
        assert.strictEqual(result, undefined);
      });
      it('should parse a valid header', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        req.headers['x-slack-retry-reason'] = 'timeout';
        const result = func.extractRetryReasonFromHTTPRequest(req);
        assert.equal(result, 'timeout');
      });
      it('should parse an array of value headers', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        req.headers['x-slack-retry-reason'] = ['timeout'];
        const result = func.extractRetryReasonFromHTTPRequest(req);
        assert.equal(result, 'timeout');
      });
    });
  });

  describe('HTTP request parsing and verification', async () => {
    describe('parseHTTPRequestBody', async () => {
      it('should parse a JSON request body', async () => {
        const req = {
          rawBody: '{"foo":"bar"}',
          headers: { 'content-type': 'application/json' },
        } as unknown as BufferedIncomingMessage;
        const result = func.parseHTTPRequestBody(req);
        assert.equal(result.foo, 'bar');
      });
      it('should parse a form request body', async () => {
        const req = {
          rawBody: `payload=${encodeURIComponent('{"foo":"bar"}')}`,
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        } as unknown as BufferedIncomingMessage;
        const result = func.parseHTTPRequestBody(req);
        assert.equal(result.foo, 'bar');
      });
    });

    describe('getHeader', async () => {
      it('should throw an exception when parsing a missing header', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        try {
          func.getHeader(req, 'Cookie');
          assert.fail('Error should be thrown here');
        } catch (e) {
          assert.ok((e as Error).message.length > 0);
        }
      });
      it('should parse a valid header', async () => {
        const req = mockInstance(IncomingMessage) as IncomingMessage;
        req.headers.Cookie = 'foo=bar';
        const result = func.getHeader(req, 'Cookie');
        assert.equal(result, 'foo=bar');
      });
    });

    describe('parseAndVerifyHTTPRequest', async () => {
      it('should parse a JSON request body', async () => {
        const signingSecret = 'secret';
        const timestamp = Math.floor(Date.now() / 1000);
        const rawBody = '{"foo":"bar"}';
        const hmac = createHmac('sha256', signingSecret);
        hmac.update(`v0:${timestamp}:${rawBody}`);
        const signature = hmac.digest('hex');
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/json',
            'x-slack-signature': `v0=${signature}`,
            'x-slack-request-timestamp': timestamp,
          },
        } as unknown as BufferedIncomingMessage;
        const res = mockInstance(ServerResponse) as unknown as ServerResponse;
        const result = await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        assert.ok(result.rawBody !== undefined);
      });
      it('should detect an invalid timestamp', async () => {
        const signingSecret = 'secret';
        const timestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes
        const rawBody = '{"foo":"bar"}';
        const hmac = createHmac('sha256', signingSecret);
        hmac.update(`v0:${timestamp}:${rawBody}`);
        const signature = hmac.digest('hex');
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/json',
            'x-slack-signature': `v0=${signature}`,
            'x-slack-request-timestamp': timestamp,
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        } catch (e) {
          assert.strictEqual(
            (e as Error).message,
            'Failed to verify authenticity: x-slack-request-timestamp must differ from system time by no more than 5 minutes or request is stale',
          );
        }
      });
      it('should detect an invalid signature', async () => {
        const signingSecret = 'secret';
        const timestamp = Math.floor(Date.now() / 1000);
        const rawBody = '{"foo":"bar"}';
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/json',
            'x-slack-signature': 'v0=invalid-signature',
            'x-slack-request-timestamp': timestamp,
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        } catch (e) {
          assert.strictEqual((e as Error).message, 'Failed to verify authenticity: signature mismatch');
        }
      });
      it('should parse a ssl_check request body without signature verification', async () => {
        const signingSecret = 'secret';
        const rawBody = 'ssl_check=1&token=legacy-fixed-verification-token';
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        const result = await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        assert.ok(result.rawBody !== undefined);
        assert.equal(result.rawBody.toString(), 'ssl_check=1');
      });
      it('should strip smuggled event payloads from ssl_check requests', async () => {
        const signingSecret = 'secret';
        const rawBody = `ssl_check=1&payload=${encodeURIComponent('{"type":"event_callback"}')}`;
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        const result = await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        assert.equal(result.rawBody.toString(), 'ssl_check=1');
      });
      it('should not bypass signature verification when ssl_check=0', async () => {
        const signingSecret = 'secret';
        const rawBody = 'ssl_check=0&token=legacy-fixed-verification-token';
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
          assert.fail('Expected an error to be thrown');
        } catch (e) {
          assert.match((e as Error).message, /Failed to verify authenticity/);
        }
      });
      it('should not bypass signature verification when ssl_check=true', async () => {
        const signingSecret = 'secret';
        const rawBody = 'ssl_check=true&token=legacy-fixed-verification-token';
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
          assert.fail('Expected an error to be thrown');
        } catch (e) {
          assert.match((e as Error).message, /Failed to verify authenticity/);
        }
      });
      it('should not bypass signature verification for ssl_check=1 with JSON content-type', async () => {
        const signingSecret = 'secret';
        const rawBody = '{"ssl_check":"1"}';
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/json',
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
          assert.fail('Expected an error to be thrown');
        } catch (e) {
          assert.match((e as Error).message, /Failed to verify authenticity/);
        }
      });
      it('should not bypass signature verification when ssl_check is empty', async () => {
        const signingSecret = 'secret';
        const rawBody = 'ssl_check=&token=legacy-fixed-verification-token';
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
          assert.fail('Expected an error to be thrown');
        } catch (e) {
          assert.match((e as Error).message, /Failed to verify authenticity/);
        }
      });
      it('should detect invalid signature for application/x-www-form-urlencoded body', async () => {
        const signingSecret = 'secret';
        const rawBody = 'payload={}';
        const timestamp = Math.floor(Date.now() / 1000);
        const req = {
          rawBody: Buffer.from(rawBody),
          headers: {
            'content-type': 'application/json',
            'x-slack-signature': 'v0=invalid-signature',
            'x-slack-request-timestamp': timestamp,
          },
        } as unknown as BufferedIncomingMessage;
        const res: ServerResponse = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        } catch (e) {
          assert.strictEqual((e as Error).message, 'Failed to verify authenticity: signature mismatch');
        }
      });
      it('should reject an oversized request body with a 413 error before signature verification', async () => {
        const signingSecret = 'secret';
        // enabled: false skips verification but still buffers first, so the limit must apply here too
        const req = streamOf('x'.repeat(1024), { 'content-type': 'application/json' });
        const res = mockInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret, enabled: false, bodyLimit: 128 }, req, res);
          assert.fail('Expected an error to be thrown');
        } catch (e) {
          assert.ok(func.isRawBodyError(e));
          assert.equal((e as { statusCode?: number }).statusCode, 413);
        }
      });
    });

    describe('bufferIncomingMessage', async () => {
      it('should buffer a request body within the configured size limit', async () => {
        const req = streamOf('{"foo":"bar"}', { 'content-type': 'application/json' });
        const result = await func.bufferIncomingMessage(req, 1024);
        assert.equal(result.rawBody.toString(), '{"foo":"bar"}');
      });
      it('should reject a request body that exceeds the configured size limit with a 413 error', async () => {
        const req = streamOf('x'.repeat(1024), { 'content-type': 'application/json' });
        try {
          await func.bufferIncomingMessage(req, 128);
          assert.fail('Expected an error to be thrown');
        } catch (error) {
          assert.ok(func.isRawBodyError(error));
          assert.equal((error as { statusCode?: number }).statusCode, 413);
        }
      });
      it('should not enforce any limit when bodyLimit is omitted', async () => {
        const req = streamOf('x'.repeat(5000), { 'content-type': 'application/json' });
        const result = await func.bufferIncomingMessage(req);
        assert.equal(result.rawBody.length, 5000);
      });
      it('should parse a string bodyLimit and reject an oversized body with a 413 error', async () => {
        const req = streamOf('x'.repeat(1024), { 'content-type': 'application/json' });
        try {
          await func.bufferIncomingMessage(req, '128b');
          assert.fail('Expected an error to be thrown');
        } catch (error) {
          assert.ok(func.isRawBodyError(error));
          assert.equal((error as { statusCode?: number }).statusCode, 413);
        }
      });
      it('should parse a string bodyLimit and buffer a body within the limit', async () => {
        const req = streamOf('{"foo":"bar"}', { 'content-type': 'application/json' });
        const result = await func.bufferIncomingMessage(req, '1kb');
        assert.equal(result.rawBody.toString(), '{"foo":"bar"}');
      });
      it('should treat a unit-less numeric string bodyLimit as a byte count and reject an oversized body', async () => {
        // '1234' has no unit, so raw-body/bytes interprets it as 1234 bytes; a 5000-byte body exceeds it.
        const req = streamOf('x'.repeat(5000), { 'content-type': 'application/json' });
        try {
          await func.bufferIncomingMessage(req, '1234');
          assert.fail('Expected an error to be thrown');
        } catch (error) {
          assert.ok(func.isRawBodyError(error));
          assert.equal((error as { statusCode?: number }).statusCode, 413);
        }
      });
      it('should not enforce any limit when bodyLimit is Infinity', async () => {
        const req = streamOf('x'.repeat(5000), { 'content-type': 'application/json' });
        const result = await func.bufferIncomingMessage(req, Infinity);
        assert.equal(result.rawBody.length, 5000);
      });
    });

    describe('defaultBodyLimit', async () => {
      it('should default to 4 MB', async () => {
        assert.equal(func.defaultBodyLimit, 4 * 1024 * 1024);
      });
    });

    describe('isRawBodyError', async () => {
      it('should detect http-errors instances by their numeric statusCode', async () => {
        const tooLarge = Object.assign(new Error('too large'), { type: 'entity.too.large', statusCode: 413 });
        const aborted = Object.assign(new Error('aborted'), { type: 'request.aborted', statusCode: 400 });
        assert.ok(func.isRawBodyError(tooLarge));
        assert.ok(func.isRawBodyError(aborted));
      });
      it('should not flag plain Errors or non-Error values', async () => {
        // A raw-body error always carries a numeric statusCode; a bare Error does not.
        assert.strictEqual(func.isRawBodyError(new Error('nope')), false);
        // A plain object is not an Error instance, so it is not a RawBodyError.
        assert.strictEqual(func.isRawBodyError({ statusCode: 413 }), false);
        assert.strictEqual(func.isRawBodyError(undefined), false);
        assert.strictEqual(func.isRawBodyError(null), false);
        assert.strictEqual(func.isRawBodyError('413'), false);
      });
    });
  });

  describe('HTTP response builder methods', async () => {
    it('should have buildContentResponse', async () => {
      const res = mockInstance(ServerResponse);
      func.buildContentResponse(res as unknown as ServerResponse, 'OK');
      assert.strictEqual(res.writeHead.mock.calls[0].arguments[0], 200);
    });
    it('should have buildNoBodyResponse', async () => {
      const res = mockInstance(ServerResponse);
      func.buildNoBodyResponse(res as unknown as ServerResponse, 500);
      assert.strictEqual(res.writeHead.mock.calls[0].arguments[0], 500);
    });
    it('should have buildSSLCheckResponse', async () => {
      const res = mockInstance(ServerResponse);
      func.buildSSLCheckResponse(res as unknown as ServerResponse);
      assert.strictEqual(res.writeHead.mock.calls[0].arguments[0], 200);
    });
    it('should have buildUrlVerificationResponse', async () => {
      const res = mockInstance(ServerResponse);
      func.buildUrlVerificationResponse(res as unknown as ServerResponse, {
        challenge: '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P',
      });
      assert.strictEqual(res.writeHead.mock.calls[0].arguments[0], 200);
    });
  });

  describe('Error handlers for event processing', async () => {
    const logger = createFakeLogger();

    describe('defaultDispatchErrorHandler', async () => {
      it('should properly handle ReceiverMultipleAckError', async () => {
        const request = mockInstance(IncomingMessage) as IncomingMessage;
        const response = mockInstance(ServerResponse);
        func.defaultDispatchErrorHandler({
          error: new ReceiverMultipleAckError(),
          logger,
          request,
          response: response as unknown as ServerResponse,
        });
        assert.strictEqual(response.writeHead.mock.calls[0].arguments[0], 500);
      });
      it('should properly handle HTTPReceiverDeferredRequestError', async () => {
        const request = mockInstance(IncomingMessage) as IncomingMessage;
        const response = mockInstance(ServerResponse);
        func.defaultDispatchErrorHandler({
          error: new HTTPReceiverDeferredRequestError('msg', request, response as unknown as ServerResponse),
          logger,
          request,
          response: response as unknown as ServerResponse,
        });
        assert.strictEqual(response.writeHead.mock.calls[0].arguments[0], 404);
      });
    });

    describe('defaultProcessEventErrorHandler', async () => {
      it('should properly handle ReceiverMultipleAckError', async () => {
        const request = mockInstance(IncomingMessage) as IncomingMessage;
        const response = mockInstance(ServerResponse);
        func.defaultProcessEventErrorHandler({
          error: new ReceiverMultipleAckError(),
          storedResponse: undefined,
          logger,
          request,
          response: response as unknown as ServerResponse,
        });
        assert.strictEqual(response.writeHead.mock.calls[0].arguments[0], 500);
      });
      it('should properly handle AuthorizationError', async () => {
        const request = mockInstance(IncomingMessage) as IncomingMessage;
        const response = mockInstance(ServerResponse);
        func.defaultProcessEventErrorHandler({
          error: new AuthorizationError('msg', new Error()),
          storedResponse: undefined,
          logger,
          request,
          response: response as unknown as ServerResponse,
        });
        assert.strictEqual(response.writeHead.mock.calls[0].arguments[0], 401);
      });
    });

    describe('defaultUnhandledRequestHandler', async () => {
      it('should properly execute', async () => {
        const request = mockInstance(IncomingMessage) as IncomingMessage;
        const response = mockInstance(ServerResponse);
        func.defaultUnhandledRequestHandler({
          logger,
          request,
          response: response as unknown as ServerResponse,
        });
        assert.strictEqual(response.writeHead.mock.calls[0].arguments[0], 404);
      });
    });
  });
});
