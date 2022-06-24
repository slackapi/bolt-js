import 'mocha';
import sinon from 'sinon';
import { assert } from 'chai';
import { IncomingMessage, ServerResponse } from 'http';
import { createHmac } from 'crypto';

import {
  ReceiverMultipleAckError,
  HTTPReceiverDeferredRequestError,
  AuthorizationError,
} from '../errors';
import { HTTPModuleFunctions as func } from './HTTPModuleFunctions';
import { createFakeLogger } from '../test-helpers';
import { BufferedIncomingMessage } from './BufferedIncomingMessage';

describe('HTTPModuleFunctions', async () => {
  describe('Request header extraction', async () => {
    describe('extractRetryNumFromHTTPRequest', async () => {
      it('should work when the header does not exist', async () => {
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
        const result = func.extractRetryNumFromHTTPRequest(req);
        assert.isUndefined(result);
      });
      it('should parse a single value header', async () => {
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
        req.headers['x-slack-retry-num'] = '2';
        const result = func.extractRetryNumFromHTTPRequest(req);
        assert.equal(result, 2);
      });
      it('should parse an array of value headers', async () => {
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
        req.headers['x-slack-retry-num'] = ['2'];
        const result = func.extractRetryNumFromHTTPRequest(req);
        assert.equal(result, 2);
      });
    });
    describe('extractRetryReasonFromHTTPRequest', async () => {
      it('should work when the header does not exist', async () => {
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
        const result = func.extractRetryReasonFromHTTPRequest(req);
        assert.isUndefined(result);
      });
      it('should parse a valid header', async () => {
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
        req.headers['x-slack-retry-reason'] = 'timeout';
        const result = func.extractRetryReasonFromHTTPRequest(req);
        assert.equal(result, 'timeout');
      });
      it('should parse an array of value headers', async () => {
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
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
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
        try {
          func.getHeader(req, 'Cookie');
          assert.fail('Error should be thrown here');
        } catch (e) {
          assert.isTrue((e as any).message.length > 0);
        }
      });
      it('should parse a valid header', async () => {
        const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        if (req.headers === undefined) { // sinon on older Node.js may not return an object here
          req.headers = {};
        }
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
        const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const result = await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        assert.isDefined(result.rawBody);
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
        const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        } catch (e) {
          assert.equal((e as any).message, 'Failed to verify authenticity: x-slack-request-timestamp must differ from system time by no more than 5 minutes or request is stale');
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
        const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        } catch (e) {
          assert.equal((e as any).message, 'Failed to verify authenticity: signature mismatch');
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
        const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const result = await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        assert.isDefined(result.rawBody);
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
        const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        try {
          await func.parseAndVerifyHTTPRequest({ signingSecret }, req, res);
        } catch (e) {
          assert.equal((e as any).message, 'Failed to verify authenticity: signature mismatch');
        }
      });
    });
  });

  describe('HTTP response builder methods', async () => {
    it('should have buildContentResponse', async () => {
      const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      res.writeHead = writeHead;
      func.buildContentResponse(res, 'OK');
      assert.isTrue(writeHead.calledWith(200));
    });
    it('should have buildNoBodyResponse', async () => {
      const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      res.writeHead = writeHead;
      func.buildNoBodyResponse(res, 500);
      assert.isTrue(writeHead.calledWith(500));
    });
    it('should have buildSSLCheckResponse', async () => {
      const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      res.writeHead = writeHead;
      func.buildSSLCheckResponse(res);
      assert.isTrue(writeHead.calledWith(200));
    });
    it('should have buildUrlVerificationResponse', async () => {
      const res: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
      const writeHead = sinon.fake();
      res.writeHead = writeHead;
      func.buildUrlVerificationResponse(res, { challenge: '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P' });
      assert.isTrue(writeHead.calledWith(200));
    });
  });

  describe('Error handlers for event processing', async () => {
    const logger = createFakeLogger();

    describe('defaultDispatchErrorHandler', async () => {
      it('should properly handle ReceiverMultipleAckError', async () => {
        const request = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const response: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        response.writeHead = writeHead;
        func.defaultDispatchErrorHandler({
          error: new ReceiverMultipleAckError(),
          logger,
          request,
          response,
        });
        assert.isTrue(writeHead.calledWith(500));
      });
      it('should properly handle HTTPReceiverDeferredRequestError', async () => {
        const request = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const response: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        response.writeHead = writeHead;
        func.defaultDispatchErrorHandler({
          error: new HTTPReceiverDeferredRequestError('msg', request, response),
          logger,
          request,
          response,
        });
        assert.isTrue(writeHead.calledWith(404));
      });
    });

    describe('defaultProcessEventErrorHandler', async () => {
      it('should properly handle ReceiverMultipleAckError', async () => {
        const request = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const response: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        response.writeHead = writeHead;
        func.defaultProcessEventErrorHandler({
          error: new ReceiverMultipleAckError(),
          storedResponse: undefined,
          logger,
          request,
          response,
        });
        assert.isTrue(writeHead.calledWith(500));
      });
      it('should properly handle AuthorizationError', async () => {
        const request = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const response: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        response.writeHead = writeHead;
        func.defaultProcessEventErrorHandler({
          error: new AuthorizationError('msg', new Error()),
          storedResponse: undefined,
          logger,
          request,
          response,
        });
        assert.isTrue(writeHead.calledWith(401));
      });
    });

    describe('defaultUnhandledRequestHandler', async () => {
      it('should properly execute', async () => {
        const request = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
        const response: ServerResponse = sinon.createStubInstance(ServerResponse) as unknown as ServerResponse;
        const writeHead = sinon.fake();
        response.writeHead = writeHead;
        func.defaultUnhandledRequestHandler({
          logger,
          request,
          response,
        });
      });
    });
  });
});
