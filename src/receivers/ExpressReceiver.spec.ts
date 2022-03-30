import 'mocha';
import sinon, { SinonFakeTimers, SinonSpy } from 'sinon';
import { assert } from 'chai';
import rewiremock from 'rewiremock';
import { Logger, LogLevel } from '@slack/logger';
import { Application, IRouter, Request, Response } from 'express';
import { Readable } from 'stream';
import { EventEmitter } from 'events';
import { Override, mergeOverrides, createFakeLogger } from '../test-helpers';
import { ErrorCode, CodedError, ReceiverInconsistentStateError, AppInitializationError, AuthorizationError } from '../errors';
import { HTTPModuleFunctions as httpFunc } from './HTTPModuleFunctions';
import App from '../App';

import ExpressReceiver, {
  respondToSslCheck,
  respondToUrlVerification,
  verifySignatureAndParseRawBody,
  buildBodyParserMiddleware,
} from './ExpressReceiver';

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
        args[0](this.closingFailure);
      });
    });
  });

  public constructor(private listeningFailure?: Error, private closingFailure?: Error) {
    super();
  }
}

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
        // eslint-disable-next-line no-param-reassign
        result.code = code;
        return {
          send: () => {
            // eslint-disable-next-line no-param-reassign
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
        customPropertiesExtractor: (req) => ({ headers: req.headers }),
      });
      assert.isNotNull(receiver);
    });
    it('should accept custom Express app / router', async () => {
      const app: Application = {
        use: sinon.fake(),
      } as unknown as Application;
      const router: IRouter = {
        get: sinon.fake(),
        post: sinon.fake(),
        use: sinon.fake(),
      } as unknown as IRouter;
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
        app,
        router,
      });
      assert.isNotNull(receiver);
      assert((app.use as any).calledOnce);
      assert((router.get as any).called);
      assert((router.post as any).calledOnce);
    });
    it('should throw an error if redirect uri options supplied invalid or incomplete', async function () {
      const clientId = 'my-clientId';
      const clientSecret = 'my-clientSecret';
      const signingSecret = 'secret';
      const stateSecret = 'my-stateSecret';
      const scopes = ['chat:write'];
      const redirectUri = 'http://example.com/heyo';
      const installerOptions = {
        redirectUriPath: '/heyo',
      };
      // correct format with redirect options supplied
      const receiver = new ExpressReceiver({
        clientId,
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri,
        installerOptions,
      });
      assert.isNotNull(receiver);
      // missing redirectUriPath
      assert.throws(() => new ExpressReceiver({
        clientId,
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri,
      }), AppInitializationError);
      // inconsistent redirectUriPath
      assert.throws(() => new ExpressReceiver({
        clientId: 'my-clientId',
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri,
        installerOptions: {
          redirectUriPath: '/hiya',
        },
      }), AppInitializationError);
      // inconsistent redirectUri
      assert.throws(() => new ExpressReceiver({
        clientId: 'my-clientId',
        clientSecret,
        signingSecret,
        stateSecret,
        scopes,
        redirectUri: 'http://example.com/hiya',
        installerOptions,
      }), AppInitializationError);
    });
  });

  describe('#start()', function () {
    it('should start listening for requests using the built-in HTTP server', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
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
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
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
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;

      // Act
      let caughtError: Error | undefined;
      try {
        await receiver.start(port);
      } catch (error: any) {
        caughtError = error;
      }

      // Assert
      assert.instanceOf(caughtError, Error);
    });
    it('should reject with an error when the built-in HTTP server returns undefined', async function () {
      // Arrange
      const fakeCreateUndefinedServer = sinon.fake.returns(undefined);
      const overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateUndefinedServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;

      // Act
      let caughtError: Error | undefined;
      try {
        await receiver.start(port);
      } catch (error: any) {
        caughtError = error;
      }

      // Assert
      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.equal((caughtError as CodedError).code, ErrorCode.ReceiverInconsistentStateError);
    });
    it('should reject with an error when starting and the server was already previously started', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;

      // Act
      let caughtError: Error | undefined;
      await receiver.start(port);
      try {
        await receiver.start(port);
      } catch (error: any) {
        caughtError = error;
      }

      // Assert
      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.equal((caughtError as CodedError).code, ErrorCode.ReceiverInconsistentStateError);
    });
  });

  describe('#stop()', function () {
    it('should stop listening for requests when a built-in HTTP server is already started', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
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
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });

      // Act
      let caughtError: Error | undefined;
      try {
        await receiver.stop();
      } catch (error: any) {
        caughtError = error;
      }

      // Assert
      // As long as control reaches this point, the test passes
      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.equal((caughtError as CodedError).code, ErrorCode.ReceiverInconsistentStateError);
    });
    it('should reject when a built-in HTTP server raises an error when closing', async function () {
      // Arrange
      this.fakeServer = new FakeServer(undefined, new Error('this error will be raised by the underlying HTTP server during close()'));
      this.fakeCreateServer = sinon.fake.returns(this.fakeServer);
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      await receiver.start(12345);

      // Act
      let caughtError: Error | undefined;
      try {
        await receiver.stop();
      } catch (error: any) {
        caughtError = error;
      }

      // Assert
      // As long as control reaches this point, the test passes
      assert.instanceOf(caughtError, Error);
      assert.equal(caughtError?.message, 'this error will be raised by the underlying HTTP server during close()');
    });
  });

  describe('#requestHandler()', function () {
    before(function () {
      this.extractRetryNumStub = sinon.stub(httpFunc, 'extractRetryNumFromHTTPRequest');
      this.extractRetryReasonStub = sinon.stub(httpFunc, 'extractRetryReasonFromHTTPRequest');
      this.buildNoBodyResponseStub = sinon.stub(httpFunc, 'buildNoBodyResponse');
      this.buildContentResponseStub = sinon.stub(httpFunc, 'buildContentResponse');
      this.processStub = sinon.stub().resolves({});
      this.ackStub = function ackStub() {};
      this.ackStub.prototype.bind = function () { return this; };
      this.ackStub.prototype.ack = sinon.spy();
    });
    afterEach(() => {
      sinon.reset();
    });
    after(function () {
      this.extractRetryNumStub.restore();
      this.extractRetryReasonStub.restore();
      this.buildNoBodyResponseStub.restore();
      this.buildContentResponseStub.restore();
    });
    it('should not build an HTTP response if processBeforeResponse=false', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        { './HTTPResponseAck': { HTTPResponseAck: this.ackStub } },
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: this.processStub }) as unknown as App;
      receiver.init(app);

      // Act
      const req = { body: { } } as Request;
      const resp = { send: () => { } } as Response;
      await receiver.requestHandler(req, resp);

      // Assert
      assert(this.buildContentResponseStub.notCalled, 'HTTPFunction buildContentResponse called incorrectly');
    });
    it('should build an HTTP response if processBeforeResponse=true', async function () {
      // Arrange
      this.processStub.callsFake((event: any) => {
        // eslint-disable-next-line no-param-reassign
        event.ack.storedResponse = 'something';
        return Promise.resolve({});
      });
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        { './HTTPResponseAck': { HTTPResponseAck: this.ackStub } },
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: this.processStub }) as unknown as App;
      receiver.init(app);

      // Act
      const req = { body: { } } as Request;
      const resp = { send: () => { } } as Response;
      await receiver.requestHandler(req, resp);
      // Assert
      assert(this.buildContentResponseStub.called, 'HTTPFunction buildContentResponse not called incorrectly');
    });
    it('should throw and build an HTTP 500 response with no body if processEvent raises an uncoded Error or a coded, non-Authorization Error', async function () {
      // Arrange
      this.processStub.callsFake(() => Promise.reject(new Error('uh oh')));
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        { './HTTPResponseAck': { HTTPResponseAck: this.ackStub } },
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: this.processStub }) as unknown as App;
      receiver.init(app);

      // Act
      const req = { body: { } } as Request;
      let writeHeadStatus = 0;
      const resp = {
        send: () => { },
        writeHead: (status: number) => { writeHeadStatus = status; },
        end: () => { },
      } as unknown as Response;
      await receiver.requestHandler(req, resp);

      // Assert
      assert.equal(writeHeadStatus, 500);
    });
    it('should build an HTTP 401 response with no body and call ack() if processEvent raises a coded AuthorizationError', async function () {
      // Arrange
      this.processStub.callsFake(() => Promise.reject(new AuthorizationError('uh oh', new Error())));
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        { './HTTPResponseAck': { HTTPResponseAck: this.ackStub } },
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: this.processStub }) as unknown as App;
      receiver.init(app);

      // Act
      const req = { body: { } } as Request;
      let writeHeadStatus = 0;
      const resp = {
        send: () => { },
        writeHead: (status: number) => { writeHeadStatus = status; },
        end: () => { },
      } as unknown as Response;
      await receiver.requestHandler(req, resp);
      // Assert
      assert.equal(writeHeadStatus, 401);
    });
  });

  describe('oauth support', function () {
    describe('install path route', function () {
      it('should call into installer.handleInstallPath when HTTP GET request hits the install path', async function () {
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const ER = await importExpressReceiver(overrides);
        const receiver = new ER({ signingSecret: '', clientSecret: '', clientId: '', stateSecret: '' });
        const handleStub = sinon.stub(receiver.installer as any, 'handleInstallPath').resolves();

        // Act
        const req = { body: { }, url: 'http://localhost/slack/install', method: 'GET' } as Request;
        const resp = { send: () => { } } as Response;
        const next = sinon.spy();
        (receiver.router as any).handle(req, resp, next);

        // Assert
        assert(handleStub.calledWith(req, resp), 'installer.handleInstallPath not called');
      });
    });
    describe('redirect path route', function () {
      it('should call installer.handleCallback with callbackOptions when HTTP request hits the redirect URI path and stateVerification=true', async function () {
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const ER = await importExpressReceiver(overrides);
        const callbackOptions = {};
        const scopes = ['some'];
        const installerOptions = {
          stateVerification: true,
          callbackOptions,
        };
        const receiver = new ER({ signingSecret: '', clientSecret: '', clientId: '', stateSecret: '', scopes, installerOptions });
        const handleStub = sinon.stub(receiver.installer as any, 'handleCallback').resolves('poop');

        // Act
        const req = { body: { }, url: 'http://localhost/slack/oauth_redirect', method: 'GET' } as Request;
        const resp = { send: () => { } } as Response;
        (receiver.router as any).handle(req, resp);

        // Assert
        assert(handleStub.calledWith(req, resp, callbackOptions), 'installer.handleCallback not called');
      });
      it('should call installer.handleCallback with callbackOptions and installUrlOptions when HTTP request hits the redirect URI path and stateVerification=false', async function () {
        const overrides = mergeOverrides(
          withHttpCreateServer(this.fakeCreateServer),
          withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        );
        const ER = await importExpressReceiver(overrides);
        const callbackOptions = {};
        const scopes = ['some'];
        const installerOptions = {
          stateVerification: false,
          callbackOptions,
        };
        const receiver = new ER({ signingSecret: '', clientSecret: '', clientId: '', stateSecret: '', scopes, installerOptions });
        const handleStub = sinon.stub(receiver.installer as any, 'handleCallback').resolves('poop');

        // Act
        const req = { body: { }, url: 'http://localhost/slack/oauth_redirect', method: 'GET' } as Request;
        const resp = { send: () => { } } as Response;
        (receiver.router as any).handle(req, resp);

        // Assert
        assert(handleStub.calledWith(req, resp, callbackOptions, sinon.match({ scopes })), 'installer.handleCallback not called');
      });
    });
  });

  describe('state management for built-in server', function () {
    it('should be able to start after it was stopped', async function () {
      // Arrange
      const overrides = mergeOverrides(
        withHttpCreateServer(this.fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
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
        const req = { body: { ssl_check: 1 } } as Request;
        let sent = false;
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
        const req = { body: { type: 'block_actions' } } as Request;
        let sent = false;
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
        const req = { body: { type: 'url_verification', challenge: 'this is it' } } as Request;
        let sentBody;
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
        const req = { body: { ssl_check: 1 } } as Request;
        let sentBody;
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

    async function runWithValidRequest(
      req: Request,
      state: any,
      signingSecretFn?: () => PromiseLike<string>,
    ): Promise<void> {
      // Arrange
      const resp = buildResponseToVerify(state);
      const next = (error: any) => {
        // eslint-disable-next-line no-param-reassign
        state.error = error;
      };

      // Act
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecretFn || signingSecret);
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
        /* 'x-slack-request-timestamp': requestTimestamp, */
        'content-type': 'application/x-www-form-urlencoded',
      };
      await verifyMissingHeaderDetection(reqAsStream as Request);
    });

    it('should detect headers missing on GCP', async () => {
      const untypedReq: { [key: string]: any } = {
        rawBody: body,
        headers: {
          'x-slack-signature': signature,
          /* 'x-slack-request-timestamp': requestTimestamp, */
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

  describe('buildBodyParserMiddleware', () => {
    beforeEach(function () {
      this.req = { body: { }, headers: { 'content-type': 'application/json' } } as Request;
      this.res = { send: () => { } } as Response;
      this.next = sinon.spy();
    });
    it('should JSON.parse a stringified rawBody if exists on a application/json request', async function () {
      this.req.rawBody = '{"awesome": true}';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(this.req, this.res, this.next);
      assert(this.next.called, 'next() was not called');
      assert.equal(this.req.body.awesome, true, 'request body JSON was not parsed');
    });
    it('should querystring.parse a stringified rawBody if exists on a application/x-www-form-urlencoded request', async function () {
      this.req.headers['content-type'] = 'application/x-www-form-urlencoded';
      this.req.rawBody = 'awesome=true';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(this.req, this.res, this.next);
      assert(this.next.called, 'next() was not called');
      assert.equal(this.req.body.awesome, 'true', 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a stringified rawBody payload if exists on a application/x-www-form-urlencoded request', async function () {
      this.req.headers['content-type'] = 'application/x-www-form-urlencoded';
      this.req.rawBody = 'payload=%7B%22awesome%22:true%7D';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(this.req, this.res, this.next);
      assert(this.next.called, 'next() was not called');
      assert.equal(this.req.body.awesome, true, 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a body if exists on a application/json request', async function () {
      this.req = new Readable();
      this.req.push('{"awesome": true}');
      this.req.push(null);
      this.req.headers = { 'content-type': 'application/json' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(this.req, this.res, this.next);
      assert(this.next.called, 'next() was not called');
      assert.equal(this.req.body.awesome, true, 'request body JSON was not parsed');
    });
    it('should querystring.parse a body if exists on a application/x-www-form-urlencoded request', async function () {
      this.req = new Readable();
      this.req.push('awesome=true');
      this.req.push(null);
      this.req.headers = { 'content-type': 'application/x-www-form-urlencoded' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(this.req, this.res, this.next);
      assert(this.next.called, 'next() was not called');
      assert.equal(this.req.body.awesome, 'true', 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a body payload if exists on a application/x-www-form-urlencoded request', async function () {
      this.req = new Readable();
      this.req.push('payload=%7B%22awesome%22:true%7D');
      this.req.push(null);
      this.req.headers = { 'content-type': 'application/x-www-form-urlencoded' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(this.req, this.res, this.next);
      assert(this.next.called, 'next() was not called');
      assert.equal(this.req.body.awesome, true, 'request body form-urlencoded was not parsed');
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
