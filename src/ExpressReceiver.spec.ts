// tslint:disable:no-implicit-dependencies
import 'mocha';

import { Logger, LogLevel } from '@slack/logger';
import { assert } from 'chai';
import { Request, Response } from 'express';
import { Agent } from 'http';
import sinon, { SinonFakeTimers } from 'sinon';
import { Readable } from 'stream';

import ExpressReceiver, {
  respondToSslCheck,
  respondToUrlVerification,
  verifySignatureAndParseBody,
} from './ExpressReceiver';

describe('ExpressReceiver', () => {

  const noopLogger: Logger = {
    debug(..._msg: any[]): void { /* noop */ },
    info(..._msg: any[]): void { /* noop */ },
    warn(..._msg: any[]): void { /* noop */ },
    error(..._msg: any[]): void { /* noop */ },
    setLevel(_level: LogLevel): void { /* noop */ },
    getLevel(): LogLevel { return LogLevel.DEBUG; },
    setName(_name: string): void { /* noop */ },
  };

  describe('constructor', () => {
    it('should accept supported arguments', async () => {
      const receiver = new ExpressReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
        endpoints: { events: '/custom-endpoint' },
        agent: new Agent({
          maxSockets: 999,
        }),
        clientTls: undefined,
      });
      assert.isNotNull(receiver);
    });
  });

  describe('start/stop', () => {
    it('should be available', async () => {
      const receiver = new ExpressReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
      });
      await receiver.start(9999);
      await receiver.stop();
    });
  });

  describe('built-in middleware', () => {
    describe('ssl_check requset handler', () => {
      it('should handle valid requests', async () => {
        // Arrange
        // tslint:disable-next-line: no-object-literal-type-assertion
        const req = { body: { ssl_check: 1 } } as Request;
        let sent = false;
        // tslint:disable-next-line: no-object-literal-type-assertion
        const resp = { send: () => { sent = true; } } as Response;
        let errorResult: any;
        const next = (error: any) => { errorResult = error; };

        // Act
        respondToSslCheck(req, resp, next);

        // Assert
        assert.isTrue(sent);
        assert.isUndefined(errorResult);
      });

      it('should work with other requests', async () => {
        // Arrange
        // tslint:disable-next-line: no-object-literal-type-assertion
        const req = { body: { type: 'block_actions' } } as Request;
        let sent = false;
        // tslint:disable-next-line: no-object-literal-type-assertion
        const resp = { send: () => { sent = true; } } as Response;
        let errorResult: any;
        const next = (error: any) => { errorResult = error; };

        // Act
        respondToSslCheck(req, resp, next);

        // Assert
        assert.isFalse(sent);
        assert.isUndefined(errorResult);
      });
    });

    describe('url_verification requset handler', () => {
      it('should handle valid requests', async () => {
        // Arrange
        // tslint:disable-next-line: no-object-literal-type-assertion
        const req = { body: { type: 'url_verification', challenge: 'this is it' } } as Request;
        let sentBody = undefined;
        // tslint:disable-next-line: no-object-literal-type-assertion
        const resp = { json: (body) => { sentBody = body; } } as Response;
        let errorResult: any;
        const next = (error: any) => { errorResult = error; };

        // Act
        respondToUrlVerification(req, resp, next);

        // Assert
        assert.equal(JSON.stringify({ challenge: 'this is it' }), JSON.stringify(sentBody));
        assert.isUndefined(errorResult);
      });

      it('should work with other requests', async () => {
        // Arrange
        // tslint:disable-next-line: no-object-literal-type-assertion
        const req = { body: { ssl_check: 1 } } as Request;
        let sentBody = undefined;
        // tslint:disable-next-line: no-object-literal-type-assertion
        const resp = { json: (body) => { sentBody = body; } } as Response;
        let errorResult: any;
        const next = (error: any) => { errorResult = error; };

        // Act
        respondToUrlVerification(req, resp, next);

        // Assert
        assert.isUndefined(sentBody);
        assert.isUndefined(errorResult);
      });
    });
  });

  describe('verifySignatureAndParseBody', () => {

    let clock: SinonFakeTimers;

    beforeEach(() => {
      // requestTimestamp = 1531420618 means this timestamp
      clock = sinon.useFakeTimers(new Date('Thu Jul 12 2018 11:36:58 GMT-0700').getTime());
    });

    afterEach(() => {
      clock.restore();
    });

    // These values are example data in the official doc
    // https://api.slack.com/docs/verifying-requests-from-slack
    const signingSecret = '8f742231b10e8888abcd99yyyzzz85a5';
    const signature = 'v0=a2114d57b48eac39b9ad189dd8316235a7b4a8d21a10bd27519666489c69b503';
    const requestTimestamp = 1531420618;
    const body = 'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c';

    function buildExpressRequest(): Request {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp,
        'content-type': 'application/x-www-form-urlencoded',
      };
      const req = reqAsStream as Request;
      return req;
    }

    function buildGCPRequest(): Request {
      const untypedReq: { [key: string]: any } = {
        rawBody: body,
        headers: {
          'x-slack-signature': signature,
          'x-slack-request-timestamp': requestTimestamp,
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
      const req = untypedReq as Request;
      return req;
    }

    // ----------------------------
    // runWithValidRequest

    async function runWithValidRequest(req: Request, state: any): Promise<void> {
      // Arrange
      // tslint:disable-next-line: no-object-literal-type-assertion
      const resp = {} as Response;
      const next = (error: any) => { state.error = error; };

      // Act
      const verifier = verifySignatureAndParseBody(noopLogger, signingSecret);
      await verifier(req, resp, next);
    }

    it('should verify requests', async () => {
      const state: any = {};
      await runWithValidRequest(buildExpressRequest(), state);
      // Assert
      assert.isUndefined(state.error);
    });

    it('should verify requests on GCP', async () => {
      const state: any = {};
      await runWithValidRequest(buildGCPRequest(), state);
      // Assert
      assert.isUndefined(state.error);
    });

    // ----------------------------
    // parse error

    it('should verify requests and then catch parse failures', async () => {
      const state: any = {};
      const req = buildExpressRequest();
      req.headers['content-type'] = undefined;
      await runWithValidRequest(req, state);
      // Assert
      assert.equal(state.error, 'SyntaxError: Unexpected token o in JSON at position 1');
    });

    it('should verify requests on GCP and then catch parse failures', async () => {
      const state: any = {};
      const req = buildGCPRequest();
      req.headers['content-type'] = undefined;
      await runWithValidRequest(req, state);
      // Assert
      assert.equal(state.error, 'SyntaxError: Unexpected token o in JSON at position 1');
    });

    // ----------------------------
    // verifyMissingHeaderDetection

    function verifyMissingHeaderDetection(req: Request): Promise<any> {
      // Arrange
      // tslint:disable-next-line: no-object-literal-type-assertion
      const resp = {} as Response;
      let errorResult: any;
      const next = (error: any) => { errorResult = error; };

      // Act
      const verifier = verifySignatureAndParseBody(noopLogger, signingSecret);
      return verifier(req, resp, next).then((_: any) => {
        // Assert
        assert.equal(errorResult, 'Error: Slack request signing verification failed. Some headers are missing.');
      });
    }

    it('should detect headers missing signature', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        // 'x-slack-signature': signature ,
        'x-slack-request-timestamp': requestTimestamp,
      };
      await verifyMissingHeaderDetection(reqAsStream as Request);
    });

    it('should detect headers missing timestamp', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        /*'x-slack-request-timestamp': requestTimestamp*/
      };
      await verifyMissingHeaderDetection(reqAsStream as Request);
    });

    it('should detect headers missing on GCP', async () => {
      const untypedReq: { [key: string]: any } = {
        rawBody: body,
        headers: {
          'x-slack-signature': signature,
          /*'x-slack-request-timestamp': requestTimestamp */
        },
      };
      await verifyMissingHeaderDetection(untypedReq as Request);
    });

    // ----------------------------
    // verifyInvalidTimestampError

    function verifyInvalidTimestampError(req: Request): Promise<any> {
      // Arrange
      // tslint:disable-next-line: no-object-literal-type-assertion
      const resp = {} as Response;
      let errorResult: any;
      const next = (error: any) => { errorResult = error; };

      // Act
      const verifier = verifySignatureAndParseBody(noopLogger, signingSecret);
      return verifier(req, resp, next).then((_: any) => {
        // Assert
        assert.equal(errorResult, 'Error: Slack request signing verification failed. Timestamp is invalid.');
      });
    }

    it('should detect invalid timestamp header', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': 'Hello there!',
      };
      await verifyInvalidTimestampError(reqAsStream as Request);
    });

    // ----------------------------
    // verifyTooOldTimestampError

    function verifyTooOldTimestampError(req: Request): Promise<any> {
      // Arrange
      // restore the valid clock
      clock.restore();

      // tslint:disable-next-line: no-object-literal-type-assertion
      const resp = {} as Response;
      let errorResult: any;
      const next = (error: any) => { errorResult = error; };

      // Act
      const verifier = verifySignatureAndParseBody(noopLogger, signingSecret);
      return verifier(req, resp, next).then((_: any) => {
        // Assert
        assert.equal(errorResult, 'Error: Slack request signing verification failed. Timestamp is too old.');
      });
    }

    it('should detect too old timestamp', async () => {
      await verifyTooOldTimestampError(buildExpressRequest());
    });

    it('should detect too old timestamp on GCP', async () => {
      await verifyTooOldTimestampError(buildGCPRequest());
    });

    // ----------------------------
    // verifySignatureMismatch

    function verifySignatureMismatch(req: Request): Promise<any> {
      // Arrange
      // tslint:disable-next-line: no-object-literal-type-assertion
      const resp = {} as Response;
      let errorResult: any;
      const next = (error: any) => { errorResult = error; };

      // Act
      const verifier = verifySignatureAndParseBody(noopLogger, signingSecret);
      verifier(req, resp, next);
      return verifier(req, resp, next).then((_: any) => {
        // Assert
        assert.equal(errorResult, 'Error: Slack request signing verification failed. Signature mismatch.');
      });
    }

    it('should detect signature mismatch', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp + 10,
      };
      const req = reqAsStream as Request;
      await verifySignatureMismatch(req);
    });

    it('should detect signature mismatch on GCP', async () => {
      const untypedReq: { [key: string]: any } = {
        rawBody: body,
        headers: {
          'x-slack-signature': signature,
          'x-slack-request-timestamp': requestTimestamp + 10,
        },
      };
      const req = untypedReq as Request;
      await verifySignatureMismatch(req);
    });

  });

});
