import 'mocha';
import sinon from 'sinon';
import { assert } from 'chai';
import { IncomingMessage, ServerResponse } from 'http';

import {
  ReceiverMultipleAckError,
  HTTPReceiverDeferredRequestError,
  AuthorizationError,
} from '../errors';
import { HTTPModuleFunctions as func } from './HTTPModuleFunctions';
import { createFakeLogger } from '../test-helpers';

describe('HTTPModuleFunctions', async () => {
  describe('Request header extraction', async () => {
    it('should have extractRetryNumFromHTTPRequest', async () => {
      const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
      req.headers['x-slack-retry-num'] = '2';
      const result = func.extractRetryNumFromHTTPRequest(req);
      assert.equal(result, 2);
    });
    it('should have extractRetryNumFromHTTPRequest', async () => {
      const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
      req.headers['x-slack-retry-reason'] = 'timeout';
      const result = func.extractRetryReasonFromHTTPRequest(req);
      assert.equal(result, 'timeout');
    });
  });

  describe('HTTP request parsing and verification', async () => {
    it('should have getHeader', async () => {
      const req = sinon.createStubInstance(IncomingMessage) as IncomingMessage;
      req.headers.Cookie = 'foo=bar';
      const result = func.getHeader(req, 'Cookie');
      assert.equal(result, 'foo=bar');
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
