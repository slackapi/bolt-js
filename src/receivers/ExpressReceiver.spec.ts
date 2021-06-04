/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/naming-convention */

import 'mocha';
import sinon, { SinonFakeTimers, SinonSpy } from 'sinon';
import { assert } from 'chai';
import { Override, mergeOverrides } from '../test-helpers';
import rewiremock from 'rewiremock';
import { Logger, LogLevel } from '@slack/logger';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import { EventEmitter } from 'events';
import { ErrorCode, CodedError, ReceiverInconsistentStateError } from '../errors';

import ExpressReceiver, {
  respondToSslCheck,
  respondToUrlVerification,
  verifySignatureAndParseRawBody,
} from './ExpressReceiver';

describe('ExpressReceiver', function () {
  beforeEach(function () {
    this.fakeServer = new FakeServer();
    this.fakeCreateServer = sinon.fake.returns(this.fakeServer);
  });

  const noopLogger: Logger = {
    debug(..._msg: any[]): void {
      /* noop */
    },
    info(..._msg: any[]): void {
      /* noop */
    },
    warn(..._msg: any[]): void {
      /* noop */
    },
    error(..._msg: any[]): void {
      /* noop */
    },
    setLevel(_level: LogLevel): void {
      /* noop */
    },
    getLevel(): LogLevel {
      return LogLevel.DEBUG;
    },
    setName(_name: string): void {
      /* noop */
    },
  };

  function buildResponseToVerify(result: any): Response {
    return {
      status: (code: number) => {
        result.code = code;
        return {
          send: () => {
            result.sent = true;
          },
        } as any as Response;
      },
    } as any as Response;
  }

  describe('constructor', () => {
    // NOTE: it would be more informative to test known valid combinations of options, as well as invalid combinations
    it('should accept supported arguments', async () => {
      const receiver = new ExpressReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
        endpoints: { events: '/custom-endpoint' },
        processBeforeResponse: true,
        clientId: 'my-clientId',
        clientSecret: 'my-client-secret',
        stateSecret: 'state-secret',
        scopes: ['channels:read'],
        installerOptions: {
          authVersion: 'v2',
          userScopes: ['chat:write'],
        },
      });
      assert.isNotNull(receiver);
    });
  });

  describe('#start()', function () {
    it('should start listening for requests using the built-in HTTP server', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ExpressReceiver = await importExpressReceiver(overrides);
      const receiver = new ExpressReceiver({ signingSecret: '' });
      const port = 12345;

      // Act
      const server = await receiver.start(port);

      // Assert
      assert(this.fakeCreateServer.calledOnce);
      assert.strictEqual(server, this.fakeServer);
      assert(this.fakeServer.listen.calledWith(port));
    });
    it('should start listening for requests using the built-in HTTPS (TLS) server when given TLS server options', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(sinon.fake.throws('Should not be used.')),
        withHttpsCreateServer(this.fakeCreateServer),
      );
      const ExpressReceiver = await importExpressReceiver(overrides);
      const receiver = new ExpressReceiver({ signingSecret: '' });
      const port = 12345;
      const tlsOptions = { key: '', cert: '' };

      // Act
      const server = await receiver.start(port, tlsOptions);

      // Assert
      assert(this.fakeCreateServer.calledOnceWith(tlsOptions));
      assert.strictEqual(server, this.fakeServer);
      assert(this.fakeServer.listen.calledWith(port));
    });

    it('should reject with an error when the built-in HTTP server fails to listen (such as EADDRINUSE)', async function () {
      // Arrange
      const fakeCreateFailingServer = sinon.fake.returns(new FakeServer(new Error('fake listening error')));
      const overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateFailingServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ExpressReceiver = await importExpressReceiver(overrides);
      const receiver = new ExpressReceiver({ signingSecret: '' });
      const port = 12345;

      // Act
      let caughtError: Error | undefined;
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      assert.instanceOf(caughtError, Error);
    });
    it('should reject with an error when starting and the server was already previously started', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ExpressReceiver = await importExpressReceiver(overrides);
      const receiver = new ExpressReceiver({ signingSecret: '' });
      const port = 12345;

      // Act
      let caughtError: Error | undefined;
      await receiver.start(port);
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error;
      }

      // Assert
      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.equal((caughtError as CodedError).code, ErrorCode.ReceiverInconsistentStateError);
    });
  });

  describe('#stop', function () {
    it('should stop listening for requests when a built-in HTTP server is already started', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ExpressReceiver = await importExpressReceiver(overrides);
      const receiver = new ExpressReceiver({ signingSecret: '' });
      const port = 12345;
      await receiver.start(port);

      // Act
      await receiver.stop();

      // Assert
      // As long as control reaches this point, the test passes
      assert.isOk(true);
    });
    it('should reject when a built-in HTTP server is not started', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ExpressReceiver = await importExpressReceiver(overrides);
      const receiver = new ExpressReceiver({ signingSecret: '' });

      // Act
      let caughtError: Error | undefined;
      try {
        await receiver.stop();
      } catch (error) {
        caughtError = error;
      }

      // Assert
      // As long as control reaches this point, the test passes
      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.equal((caughtError as CodedError).code, ErrorCode.ReceiverInconsistentStateError);
    });
  });

  describe('state management for built-in server', function () {
    it('should be able to start after it was stopped', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ExpressReceiver = await importExpressReceiver(overrides);
      const receiver = new ExpressReceiver({ signingSecret: '' });
      const port = 12345;
      await receiver.start(port);
      await receiver.stop();

      // Act
      await receiver.start(port);

      // Assert
      // As long as control reaches this point, the test passes
      assert.isOk(true);
    });
  });

  describe('built-in middleware', () => {
    describe('ssl_check request handler', () => {
      it('should handle valid requests', async () => {
        // Arrange
        // tslint:disable-next-line: no-object-literal-type-assertion
        const req = { body: { ssl_check: 1 } } as Request;
        let sent = false;
        // tslint:disable-next-line: no-object-literal-type-assertion
        const resp = {
          send: () => {
            sent = true;
          },
        } as Response;
        let errorResult: any;
        const next = (error: any) => {
          errorResult = error;
        };

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
        const resp = {
          send: () => {
            sent = true;
          },
        } as Response;
        let errorResult: any;
        const next = (error: any) => {
          errorResult = error;
        };

        // Act
        respondToSslCheck(req, resp, next);

        // Assert
        assert.isFalse(sent);
        assert.isUndefined(errorResult);
      });
    });

    describe('url_verification request handler', () => {
      it('should handle valid requests', async () => {
        // Arrange
        // tslint:disable-next-line: no-object-literal-type-assertion
        const req = { body: { type: 'url_verification', challenge: 'this is it' } } as Request;
        let sentBody = undefined;
        // tslint:disable-next-line: no-object-literal-type-assertion
        const resp = {
          json: (body) => {
            sentBody = body;
          },
        } as Response;
        let errorResult: any;
        const next = (error: any) => {
          errorResult = error;
        };

        // Act
        respondToUrlVerification(req, resp, next);

        // Assert
        assert.equal(JSON.stringify(sentBody), JSON.stringify({ challenge: 'this is it' }));
        assert.isUndefined(errorResult);
      });

      it('should work with other requests', async () => {
        // Arrange
        // tslint:disable-next-line: no-object-literal-type-assertion
        const req = { body: { ssl_check: 1 } } as Request;
        let sentBody = undefined;
        // tslint:disable-next-line: no-object-literal-type-assertion
        const resp = {
          json: (body) => {
            sentBody = body;
          },
        } as Response;
        let errorResult: any;
        const next = (error: any) => {
          errorResult = error;
        };

        // Act
        respondToUrlVerification(req, resp, next);

        // Assert
        assert.isUndefined(sentBody);
        assert.isUndefined(errorResult);
      });
    });
  });

  describe('verifySignatureAndParseRawBody', () => {
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
    const body =
      'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c';

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

    async function runWithValidRequest(
      req: Request,
      state: any,
      signingSecretFn?: () => PromiseLike<string>,
    ): Promise<void> {
      // Arrange
      const resp = buildResponseToVerify(state);
      const next = (error: any) => {
        state.error = error;
      };

      // Act
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecretFn || signingSecret);
      // eslint-disable-next-line @typescript-eslint/await-thenable
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

    it('should verify requests on GCP using async signingSecret', async () => {
      const state: any = {};
      await runWithValidRequest(buildGCPRequest(), state, () => Promise.resolve(signingSecret));
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
      assert.equal(state.code, 400);
      assert.equal(state.sent, true);
    });

    it('should verify requests on GCP and then catch parse failures', async () => {
      const state: any = {};
      const req = buildGCPRequest();
      req.headers['content-type'] = undefined;
      await runWithValidRequest(req, state);
      // Assert
      assert.equal(state.code, 400);
      assert.equal(state.sent, true);
    });

    // ----------------------------
    // verifyContentTypeAbsence

    async function verifyRequestsWithoutContentTypeHeader(req: Request): Promise<void> {
      // Arrange
      const result: any = {};
      const resp = buildResponseToVerify(result);

      const next = sinon.fake();

      // Act
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await verifier(req, resp, next);

      // Assert
      assert.equal(result.code, 400);
      assert.equal(result.sent, true);
    }

    it('should fail to parse request body without content-type header', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp,
        // 'content-type': 'application/x-www-form-urlencoded',
      };
      const req = reqAsStream as Request;
      await verifyRequestsWithoutContentTypeHeader(req);
    });

    it('should verify parse request body without content-type header on GCP', async () => {
      const untypedReq: { [key: string]: any } = {
        rawBody: body,
        headers: {
          'x-slack-signature': signature,
          'x-slack-request-timestamp': requestTimestamp,
          // 'content-type': 'application/x-www-form-urlencoded',
        },
      };
      const req = untypedReq as Request;
      await verifyRequestsWithoutContentTypeHeader(req);
    });

    // ----------------------------
    // verifyMissingHeaderDetection

    async function verifyMissingHeaderDetection(req: Request): Promise<void> {
      // Arrange
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();

      // Act
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await verifier(req, resp, next);

      // Assert
      assert.equal(result.code, 401);
      assert.equal(result.sent, true);
    }

    it('should detect headers missing signature', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        // 'x-slack-signature': signature ,
        'x-slack-request-timestamp': requestTimestamp,
        'content-type': 'application/x-www-form-urlencoded',
      };
      await verifyMissingHeaderDetection(reqAsStream as Request);
    });

    it('should detect headers missing timestamp', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        /*'x-slack-request-timestamp': requestTimestamp, */
        'content-type': 'application/x-www-form-urlencoded',
      };
      await verifyMissingHeaderDetection(reqAsStream as Request);
    });

    it('should detect headers missing on GCP', async () => {
      const untypedReq: { [key: string]: any } = {
        rawBody: body,
        headers: {
          'x-slack-signature': signature,
          /*'x-slack-request-timestamp': requestTimestamp, */
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
      await verifyMissingHeaderDetection(untypedReq as Request);
    });

    // ----------------------------
    // verifyInvalidTimestampError

    async function verifyInvalidTimestampError(req: Request): Promise<void> {
      // Arrange
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();

      // Act

      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await verifier(req, resp, next);

      // Assert
      assert.equal(result.code, 401);
      assert.equal(result.sent, true);
    }

    it('should detect invalid timestamp header', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': 'Hello there!',
        'content-type': 'application/x-www-form-urlencoded',
      };
      await verifyInvalidTimestampError(reqAsStream as Request);
    });

    // ----------------------------
    // verifyTooOldTimestampError

    async function verifyTooOldTimestampError(req: Request): Promise<void> {
      // Arrange
      // restore the valid clock
      clock.restore();

      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();

      // Act
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await verifier(req, resp, next);

      // Assert
      assert.equal(result.code, 401);
      assert.equal(result.sent, true);
    }

    it('should detect too old timestamp', async () => {
      await verifyTooOldTimestampError(buildExpressRequest());
    });

    it('should detect too old timestamp on GCP', async () => {
      await verifyTooOldTimestampError(buildGCPRequest());
    });

    // ----------------------------
    // verifySignatureMismatch

    async function verifySignatureMismatch(req: Request): Promise<void> {
      // Arrange
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();

      // Act
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      verifier(req, resp, next);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await verifier(req, resp, next);

      // Assert
      assert.equal(result.code, 401);
      assert.equal(result.sent, true);
    }

    it('should detect signature mismatch', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      (reqAsStream as { [key: string]: any }).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp + 10,
        'content-type': 'application/x-www-form-urlencoded',
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
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
      const req = untypedReq as Request;
      await verifySignatureMismatch(req);
    });
  });
});

/* Testing Harness */

// Loading the system under test using overrides
async function importExpressReceiver(overrides: Override = {}): Promise<typeof import('./ExpressReceiver').default> {
  return (await rewiremock.module(() => import('./ExpressReceiver'), overrides)).default;
}

// Composable overrides
function withHttpCreateServer(spy: SinonSpy): Override {
  return {
    http: {
      createServer: spy,
    },
  };
}

function withHttpsCreateServer(spy: SinonSpy): Override {
  return {
    https: {
      createServer: spy,
    },
  };
}

// Fakes
class FakeServer extends EventEmitter {
  public on = sinon.fake();
  public listen = sinon.fake((...args: any[]) => {
    if (this.listeningFailure !== undefined) {
      this.emit('error', this.listeningFailure);
      return;
    }
    setImmediate(() => {
      args[1]();
    });
  });
  public close = sinon.fake((...args: any[]) => {
    setImmediate(() => {
      this.emit('close');
      setImmediate(() => {
        args[0]();
      });
    });
  });

  constructor(private listeningFailure?: Error) {
    super();
  }
}
