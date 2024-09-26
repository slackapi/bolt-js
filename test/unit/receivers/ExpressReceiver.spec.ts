import type { Server } from 'node:http';
import type { Server as HTTPSServer } from 'node:https';
import { Readable } from 'node:stream';
import type { InstallProvider } from '@slack/oauth';
import { assert } from 'chai';
import type { Application, IRouter, Request, Response } from 'express';
import rewiremock from 'rewiremock';
import sinon, { type SinonFakeTimers } from 'sinon';
import App from '../../../src/App';
import {
  AppInitializationError,
  AuthorizationError,
  ErrorCode,
  ReceiverInconsistentStateError,
} from '../../../src/errors';
import ExpressReceiver, {
  respondToSslCheck,
  respondToUrlVerification,
  verifySignatureAndParseRawBody,
  buildBodyParserMiddleware,
} from '../../../src/receivers/ExpressReceiver';
import * as httpFunc from '../../../src/receivers/HTTPModuleFunctions';
import type { ReceiverEvent } from '../../../src/types';
import {
  FakeServer,
  type Override,
  createFakeLogger,
  mergeOverrides,
  withHttpCreateServer,
  withHttpsCreateServer,
} from '../helpers';

// Loading the system under test using overrides
async function importExpressReceiver(
  overrides: Override = {},
): Promise<typeof import('../../../src/receivers/ExpressReceiver').default> {
  return (await rewiremock.module(() => import('../../../src/receivers/ExpressReceiver'), overrides)).default;
}

// biome-ignore lint/suspicious/noExplicitAny: accept any kind of mock response
function buildResponseToVerify(result: any): Response {
  return {
    status: (code: number) => {
      result.code = code;
      return {
        send: () => {
          result.sent = true;
        },
      } as Response;
    },
  } as Response;
}

describe('ExpressReceiver', () => {
  const noopLogger = createFakeLogger();
  let fakeServer: FakeServer;
  let fakeCreateServer: sinon.SinonSpy;
  let overrides: Override;
  beforeEach(() => {
    fakeServer = new FakeServer();
    fakeCreateServer = sinon.fake.returns(fakeServer);
    overrides = mergeOverrides(
      withHttpCreateServer(fakeCreateServer),
      withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
    );
  });

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
      const app = {
        use: sinon.fake(),
      };
      const router = {
        get: sinon.fake(),
        post: sinon.fake(),
        use: sinon.fake(),
      };
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
        app: app as unknown as Application,
        router: router as unknown as IRouter,
      });
      assert.isNotNull(receiver);
      sinon.assert.calledOnce(app.use);
      sinon.assert.calledOnce(router.get);
      sinon.assert.calledOnce(router.post);
    });
    it('should throw an error if redirect uri options supplied invalid or incomplete', async () => {
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
      assert.throws(
        () =>
          new ExpressReceiver({
            clientId,
            clientSecret,
            signingSecret,
            stateSecret,
            scopes,
            redirectUri,
          }),
        AppInitializationError,
      );
      // inconsistent redirectUriPath
      assert.throws(
        () =>
          new ExpressReceiver({
            clientId: 'my-clientId',
            clientSecret,
            signingSecret,
            stateSecret,
            scopes,
            redirectUri,
            installerOptions: {
              redirectUriPath: '/hiya',
            },
          }),
        AppInitializationError,
      );
      // inconsistent redirectUri
      assert.throws(
        () =>
          new ExpressReceiver({
            clientId: 'my-clientId',
            clientSecret,
            signingSecret,
            stateSecret,
            scopes,
            redirectUri: 'http://example.com/hiya',
            installerOptions,
          }),
        AppInitializationError,
      );
    });
  });

  describe('#start()', () => {
    it('should start listening for requests using the built-in HTTP server', async () => {
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;

      const server = await receiver.start(port);

      sinon.assert.calledOnce(fakeCreateServer);
      assert.strictEqual(server, fakeServer as unknown as Server);
      sinon.assert.calledWith(fakeServer.listen, port);
    });
    it('should start listening for requests using the built-in HTTPS (TLS) server when given TLS server options', async () => {
      overrides = mergeOverrides(
        withHttpCreateServer(sinon.fake.throws('Should not be used.')),
        withHttpsCreateServer(fakeCreateServer),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;
      const tlsOptions = { key: '', cert: '' };

      const server = await receiver.start(port, tlsOptions);

      sinon.assert.calledWith(fakeCreateServer, tlsOptions);
      assert.strictEqual(server, fakeServer as unknown as HTTPSServer);
      sinon.assert.calledWith(fakeServer.listen, port);
    });
    it('should reject with an error when the built-in HTTP server fails to listen (such as EADDRINUSE)', async () => {
      const fakeCreateFailingServer = sinon.fake.returns(new FakeServer(new Error('fake listening error')));
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateFailingServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;

      let caughtError: Error | undefined;
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error as Error;
      }

      assert.instanceOf(caughtError, Error);
    });
    it('should reject with an error when the built-in HTTP server returns undefined', async () => {
      const fakeCreateUndefinedServer = sinon.fake.returns(undefined);
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateUndefinedServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;

      let caughtError: Error | undefined;
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error as Error;
      }

      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.propertyVal(caughtError, 'code', ErrorCode.ReceiverInconsistentStateError);
    });
    it('should reject with an error when starting and the server was already previously started', async () => {
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;

      let caughtError: Error | undefined;
      await receiver.start(port);
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error as Error;
      }

      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.propertyVal(caughtError, 'code', ErrorCode.ReceiverInconsistentStateError);
    });
  });

  describe('#stop()', () => {
    it('should stop listening for requests when a built-in HTTP server is already started', async () => {
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;
      await receiver.start(port);

      await receiver.stop();
    });
    it('should reject when a built-in HTTP server is not started', async () => {
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });

      let caughtError: Error | undefined;
      try {
        await receiver.stop();
      } catch (error) {
        caughtError = error as Error;
      }

      assert.instanceOf(caughtError, ReceiverInconsistentStateError);
      assert.propertyVal(caughtError, 'code', ErrorCode.ReceiverInconsistentStateError);
    });
    it('should reject when a built-in HTTP server raises an error when closing', async () => {
      fakeServer = new FakeServer(
        undefined,
        new Error('this error will be raised by the underlying HTTP server during close()'),
      );
      fakeCreateServer = sinon.fake.returns(fakeServer);
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
      );
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      await receiver.start(12345);

      let caughtError: Error | undefined;
      try {
        await receiver.stop();
      } catch (error) {
        caughtError = error as Error;
      }

      assert.instanceOf(caughtError, Error);
      assert.equal(caughtError?.message, 'this error will be raised by the underlying HTTP server during close()');
    });
  });

  describe('#requestHandler()', () => {
    const extractRetryNumStub = sinon.stub(httpFunc, 'extractRetryNumFromHTTPRequest');
    const extractRetryReasonStub = sinon.stub(httpFunc, 'extractRetryReasonFromHTTPRequest');
    const buildNoBodyResponseStub = sinon.stub(httpFunc, 'buildNoBodyResponse');
    const buildContentResponseStub = sinon.stub(httpFunc, 'buildContentResponse');
    const processStub = sinon.stub<[ReceiverEvent]>().resolves({});
    const ackStub = function ackStub() {};
    ackStub.prototype.bind = function () {
      return this;
    };
    ackStub.prototype.ack = sinon.spy();
    beforeEach(() => {
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateServer),
        withHttpsCreateServer(sinon.fake.throws('Should not be used.')),
        { './HTTPResponseAck': { HTTPResponseAck: ackStub } },
      );
    });
    afterEach(() => {
      sinon.reset();
    });
    after(() => {
      extractRetryNumStub.restore();
      extractRetryReasonStub.restore();
      buildNoBodyResponseStub.restore();
      buildContentResponseStub.restore();
    });
    it('should not build an HTTP response if processBeforeResponse=false', async () => {
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = { send: () => {} } as Response;
      await receiver.requestHandler(req, resp);

      sinon.assert.notCalled(buildContentResponseStub);
    });
    it('should build an HTTP response if processBeforeResponse=true', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: TODO: dig in to see what this type actually is supposed to be
      processStub.callsFake((event: any) => {
        event.ack.storedResponse = 'something';
        return Promise.resolve({});
      });
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = { send: () => {} } as Response;
      await receiver.requestHandler(req, resp);
      sinon.assert.called(buildContentResponseStub);
    });
    it('should throw and build an HTTP 500 response with no body if processEvent raises an uncoded Error or a coded, non-Authorization Error', async () => {
      processStub.callsFake(() => Promise.reject(new Error('uh oh')));
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = {
        send: sinon.fake(),
        writeHead: sinon.fake(),
        end: sinon.fake(),
      };
      await receiver.requestHandler(req, resp as unknown as Response);
      sinon.assert.calledWith(resp.writeHead, 500);
    });
    it('should build an HTTP 401 response with no body and call ack() if processEvent raises a coded AuthorizationError', async () => {
      processStub.callsFake(() => Promise.reject(new AuthorizationError('uh oh', new Error())));
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const app = sinon.createStubInstance(App, { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = {
        send: sinon.fake(),
        writeHead: sinon.fake(),
        end: sinon.fake(),
      };
      await receiver.requestHandler(req, resp as unknown as Response);
      sinon.assert.calledWith(resp.writeHead, 401);
    });
  });

  describe('oauth support', () => {
    describe('install path route', () => {
      it('should call into installer.handleInstallPath when HTTP GET request hits the install path', async () => {
        const ER = await importExpressReceiver(overrides);
        const receiver = new ER({ signingSecret: '', clientSecret: '', clientId: '', stateSecret: '' });
        const handleStub = sinon.stub(receiver.installer as InstallProvider, 'handleInstallPath').resolves();

        const req = { body: {}, url: 'http://localhost/slack/install', method: 'GET' } as Request;
        const resp = { send: () => {} } as Response;
        const next = sinon.spy();
        // biome-ignore lint/suspicious/noExplicitAny: TODO: better way to get a reference to handle? dealing with express internals, unclear
        (receiver.router as any).handle(req, resp, next);

        sinon.assert.calledWith(handleStub, req, resp);
      });
    });
    describe('redirect path route', () => {
      it('should call installer.handleCallback with callbackOptions when HTTP request hits the redirect URI path and stateVerification=true', async () => {
        const ER = await importExpressReceiver(overrides);
        const callbackOptions = {};
        const scopes = ['some'];
        const installerOptions = {
          stateVerification: true,
          callbackOptions,
        };
        const receiver = new ER({
          signingSecret: '',
          clientSecret: '',
          clientId: '',
          stateSecret: '',
          scopes,
          installerOptions,
        });
        const handleStub = sinon.stub(receiver.installer as InstallProvider, 'handleCallback').resolves();

        const req = { body: {}, url: 'http://localhost/slack/oauth_redirect', method: 'GET' } as Request;
        const resp = { send: () => {} } as Response;
        // biome-ignore lint/suspicious/noExplicitAny: TODO: better way to get a reference to handle? dealing with express internals, unclear
        (receiver.router as any).handle(req, resp, () => {});

        sinon.assert.calledWith(handleStub, req, resp, callbackOptions);
      });
      it('should call installer.handleCallback with callbackOptions and installUrlOptions when HTTP request hits the redirect URI path and stateVerification=false', async () => {
        const ER = await importExpressReceiver(overrides);
        const callbackOptions = {};
        const scopes = ['some'];
        const installerOptions = {
          stateVerification: false,
          callbackOptions,
        };
        const receiver = new ER({
          signingSecret: '',
          clientSecret: '',
          clientId: '',
          stateSecret: '',
          scopes,
          installerOptions,
        });
        const handleStub = sinon.stub(receiver.installer as InstallProvider, 'handleCallback').resolves();

        const req = { body: {}, url: 'http://localhost/slack/oauth_redirect', method: 'GET' } as Request;
        const resp = { send: () => {} } as Response;
        // biome-ignore lint/suspicious/noExplicitAny: TODO: better way to get a reference to handle? dealing with express internals, unclear
        (receiver.router as any).handle(req, resp, () => {});

        sinon.assert.calledWith(handleStub, req, resp, callbackOptions, sinon.match({ scopes }));
      });
    });
  });

  describe('state management for built-in server', () => {
    it('should be able to start after it was stopped', async () => {
      const ER = await importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: '' });
      const port = 12345;
      await receiver.start(port);
      await receiver.stop();
      await receiver.start(port);
    });
  });

  describe('built-in middleware', () => {
    describe('ssl_check request handler', () => {
      it('should handle valid ssl_check requests and not call next()', async () => {
        const req = { body: { ssl_check: 1 } } as Request;
        const resp = {
          send: sinon.fake(),
        };
        const next = sinon.spy();
        respondToSslCheck(req, resp as unknown as Response, next);
        sinon.assert.called(resp.send);
        sinon.assert.notCalled(next);
      });

      it('should work with other requests', async () => {
        const req = { body: { type: 'block_actions' } } as Request;
        const resp = {
          send: sinon.fake(),
        };
        const next = sinon.spy();
        respondToSslCheck(req, resp as unknown as Response, next);
        sinon.assert.notCalled(resp.send);
        sinon.assert.called(next);
      });
    });

    describe('url_verification request handler', () => {
      it('should handle valid requests', async () => {
        const req = { body: { type: 'url_verification', challenge: 'this is it' } } as Request;
        const resp = {
          json: sinon.fake(),
        };
        const next = sinon.spy();
        respondToUrlVerification(req, resp as unknown as Response, next);
        sinon.assert.calledWith(resp.json, sinon.match({ challenge: 'this is it' }));
        sinon.assert.notCalled(next);
      });

      it('should work with other requests', async () => {
        const req = { body: { ssl_check: 1 } } as Request;
        const resp = {
          json: sinon.fake(),
        };
        const next = sinon.spy();
        respondToUrlVerification(req, resp as unknown as Response, next);
        sinon.assert.notCalled(resp.json);
        sinon.assert.called(next);
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
      // biome-ignore lint/suspicious/noExplicitAny: mock requests can be anything
      (reqAsStream as Record<string, any>).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp,
        'content-type': 'application/x-www-form-urlencoded',
      };
      const req = reqAsStream as Request;
      return req;
    }

    function buildGCPRequest(): Request {
      // biome-ignore lint/suspicious/noExplicitAny: mock requests can be anything
      const untypedReq: Record<string, any> = {
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
      // biome-ignore lint/suspicious/noExplicitAny: mock requests can be anything
      state: any,
      signingSecretFn?: () => PromiseLike<string>,
    ): Promise<void> {
      const resp = buildResponseToVerify(state);
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const next = (error: any) => {
        state.error = error;
      };
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecretFn || signingSecret);
      await verifier(req, resp, next);
    }

    it('should verify requests', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const state: any = {};
      await runWithValidRequest(buildExpressRequest(), state);
      assert.isUndefined(state.error);
    });

    it('should verify requests on GCP', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const state: any = {};
      await runWithValidRequest(buildGCPRequest(), state);
      assert.isUndefined(state.error);
    });

    it('should verify requests on GCP using async signingSecret', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const state: any = {};
      await runWithValidRequest(buildGCPRequest(), state, () => Promise.resolve(signingSecret));
      assert.isUndefined(state.error);
    });

    // ----------------------------
    // parse error

    it('should verify requests and then catch parse failures', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const state: any = {};
      const req = buildExpressRequest();
      req.headers['content-type'] = undefined;
      await runWithValidRequest(req, state);
      assert.equal(state.code, 400);
      assert.equal(state.sent, true);
    });

    it('should verify requests on GCP and then catch parse failures', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const state: any = {};
      const req = buildGCPRequest();
      req.headers['content-type'] = undefined;
      await runWithValidRequest(req, state);
      assert.equal(state.code, 400);
      assert.equal(state.sent, true);
    });

    // ----------------------------
    // verifyContentTypeAbsence

    async function verifyRequestsWithoutContentTypeHeader(req: Request): Promise<void> {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      await verifier(req, resp, next);
      assert.equal(result.code, 400);
      assert.equal(result.sent, true);
    }

    it('should fail to parse request body without content-type header', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      (reqAsStream as any).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp,
        // 'content-type': 'application/x-www-form-urlencoded',
      };
      const req = reqAsStream as Request;
      await verifyRequestsWithoutContentTypeHeader(req);
    });

    it('should verify parse request body without content-type header on GCP', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const untypedReq: any = {
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
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      await verifier(req, resp, next);
      assert.equal(result.code, 401);
      assert.equal(result.sent, true);
    }

    it('should detect headers missing signature', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      (reqAsStream as any).headers = {
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
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      (reqAsStream as any).headers = {
        'x-slack-signature': signature,
        /* 'x-slack-request-timestamp': requestTimestamp, */
        'content-type': 'application/x-www-form-urlencoded',
      };
      await verifyMissingHeaderDetection(reqAsStream as Request);
    });

    it('should detect headers missing on GCP', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const untypedReq: any = {
        rawBody: body,
        headers: {
          'x-slack-signature': signature,
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
      await verifyMissingHeaderDetection(untypedReq as Request);
    });

    // ----------------------------
    // verifyInvalidTimestampError

    async function verifyInvalidTimestampError(req: Request): Promise<void> {
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      await verifier(req, resp, next);
      assert.equal(result.code, 401);
      assert.equal(result.sent, true);
    }

    it('should detect invalid timestamp header', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      (reqAsStream as any).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': 'Hello there!',
        'content-type': 'application/x-www-form-urlencoded',
      };
      await verifyInvalidTimestampError(reqAsStream as Request);
    });

    // ----------------------------
    // verifyTooOldTimestampError

    async function verifyTooOldTimestampError(req: Request): Promise<void> {
      // restore the valid clock
      clock.restore();
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      await verifier(req, resp, next);
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
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = sinon.fake();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret);
      verifier(req, resp, next);
      await verifier(req, resp, next);
      assert.equal(result.code, 401);
      assert.equal(result.sent, true);
    }

    it('should detect signature mismatch', async () => {
      const reqAsStream = new Readable();
      reqAsStream.push(body);
      reqAsStream.push(null); // indicate EOF
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      (reqAsStream as any).headers = {
        'x-slack-signature': signature,
        'x-slack-request-timestamp': requestTimestamp + 10,
        'content-type': 'application/x-www-form-urlencoded',
      };
      const req = reqAsStream as Request;
      await verifySignatureMismatch(req);
    });

    it('should detect signature mismatch on GCP', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const untypedReq: any = {
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
    // biome-ignore lint/suspicious/noExplicitAny: requests can be anything when testing
    let req: any = { body: {}, headers: { 'content-type': 'application/json' } };
    const res = { send: sinon.spy() };
    const next = sinon.spy();
    beforeEach(() => {
      req = { body: {}, headers: { 'content-type': 'application/json' } };
      res.send.resetHistory();
      next.resetHistory();
    });
    it('should JSON.parse a stringified rawBody if exists on a application/json request', async () => {
      req.rawBody = '{"awesome": true}';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      sinon.assert.called(next);
      assert.equal(req.body.awesome, true, 'request body JSON was not parsed');
    });
    it('should querystring.parse a stringified rawBody if exists on a application/x-www-form-urlencoded request', async () => {
      req.headers['content-type'] = 'application/x-www-form-urlencoded';
      req.rawBody = 'awesome=true';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      sinon.assert.called(next);
      assert.equal(req.body.awesome, 'true', 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a stringified rawBody payload if exists on a application/x-www-form-urlencoded request', async () => {
      req.headers['content-type'] = 'application/x-www-form-urlencoded';
      req.rawBody = 'payload=%7B%22awesome%22:true%7D';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      sinon.assert.called(next);
      assert.equal(req.body.awesome, true, 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a body if exists on a application/json request', async () => {
      req = new Readable();
      req.push('{"awesome": true}');
      req.push(null);
      req.headers = { 'content-type': 'application/json' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      sinon.assert.called(next);
      assert.equal(req.body.awesome, true, 'request body JSON was not parsed');
    });
    it('should querystring.parse a body if exists on a application/x-www-form-urlencoded request', async () => {
      req = new Readable();
      req.push('awesome=true');
      req.push(null);
      req.headers = { 'content-type': 'application/x-www-form-urlencoded' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      assert(next.called, 'next() was not called');
      assert.equal(req.body.awesome, 'true', 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a body payload if exists on a application/x-www-form-urlencoded request', async () => {
      req = new Readable();
      req.push('payload=%7B%22awesome%22:true%7D');
      req.push(null);
      req.headers = { 'content-type': 'application/x-www-form-urlencoded' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      sinon.assert.called(next);
      assert.equal(req.body.awesome, true, 'request body form-urlencoded was not parsed');
    });
  });
});
