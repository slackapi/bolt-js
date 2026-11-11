import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { Server as HTTPSServer } from 'node:https';
import path from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import type { InstallProvider } from '@slack/oauth';
import type { Application, IRouter, Request, Response } from 'express';
import App from '../../../src/App';
import {
  AppInitializationError,
  AuthorizationError,
  ErrorCode,
  ReceiverInconsistentStateError,
} from '../../../src/errors';
import ExpressReceiver, {
  buildBodyParserMiddleware,
  respondToSslCheck,
  respondToUrlVerification,
  verifySignatureAndParseBody,
  verifySignatureAndParseRawBody,
} from '../../../src/receivers/ExpressReceiver';
import type { ReceiverEvent } from '../../../src/types';
import {
  createFakeLogger,
  FakeServer,
  type MockFn,
  mergeOverrides,
  mockInstance,
  type Override,
  proxyquire,
  withHttpCreateServer,
  withHttpsCreateServer,
} from '../helpers';

// Loading the system under test using overrides
function importExpressReceiver(
  overrides: Override = {},
): typeof import('../../../src/receivers/ExpressReceiver').default {
  const absolutePath = path.resolve(__dirname, '../../../src/receivers/ExpressReceiver');
  return proxyquire(absolutePath, overrides).default;
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
  let fakeCreateServer: MockFn;
  let overrides: Override;

  beforeEach(() => {
    fakeServer = new FakeServer();
    fakeCreateServer = mock.fn(() => fakeServer);
    overrides = mergeOverrides(
      withHttpCreateServer(fakeCreateServer),
      withHttpsCreateServer(
        mock.fn(() => {
          throw new Error('Should not be used.');
        }),
      ),
    );
  });

  describe('constructor', () => {
    it('should throw an error if signingSecret is empty string and signature verification enabled', async () => {
      try {
        new ExpressReceiver({ signingSecret: '' });
        assert.fail();
      } catch (error) {
        assert.ok(error instanceof AppInitializationError);
      }
    });

    it('should succeed with empty signingSecret when signatureVerification is false', async () => {
      const receiver = new ExpressReceiver({ signingSecret: '', signatureVerification: false });
      assert.notStrictEqual(receiver, null);
    });

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
      assert.notStrictEqual(receiver, null);
    });
    it('should accept custom Express app / router', async () => {
      const app = {
        use: mock.fn(),
      };
      const router = {
        get: mock.fn(),
        post: mock.fn(),
        use: mock.fn(),
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
      assert.notStrictEqual(receiver, null);
      assert.strictEqual(app.use.mock.callCount(), 1);
      assert.strictEqual(router.get.mock.callCount(), 1);
      assert.strictEqual(router.post.mock.callCount(), 1);
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
      assert.notStrictEqual(receiver, null);
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
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const port = 12345;

      const server = await receiver.start(port);

      assert.strictEqual(fakeCreateServer.mock.callCount(), 1);
      assert.strictEqual(server, fakeServer as unknown as Server);
      assert.strictEqual(fakeServer.listen.mock.calls[0].arguments[0], port);
    });
    it('should start listening for requests using the built-in HTTPS (TLS) server when given TLS server options', async () => {
      overrides = mergeOverrides(
        withHttpCreateServer(
          mock.fn(() => {
            throw new Error('Should not be used.');
          }),
        ),
        withHttpsCreateServer(fakeCreateServer),
      );
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const port = 12345;
      const tlsOptions = { key: '', cert: '' };

      const server = await receiver.start(port, tlsOptions);

      assert.deepStrictEqual(fakeCreateServer.mock.calls[0].arguments.slice(0, 1), [tlsOptions]);
      assert.strictEqual(server, fakeServer as unknown as HTTPSServer);
      assert.strictEqual(fakeServer.listen.mock.calls[0].arguments[0], port);
    });
    it('should reject with an error when the built-in HTTP server fails to listen (such as EADDRINUSE)', async () => {
      const fakeCreateFailingServer = mock.fn(() => new FakeServer(new Error('fake listening error')));
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateFailingServer),
        withHttpsCreateServer(
          mock.fn(() => {
            throw new Error('Should not be used.');
          }),
        ),
      );
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const port = 12345;

      let caughtError: Error | undefined;
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error as Error;
      }

      assert.ok(caughtError instanceof Error);
    });
    it('should reject with an error when the built-in HTTP server returns undefined', async () => {
      const fakeCreateUndefinedServer = mock.fn(() => undefined);
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateUndefinedServer),
        withHttpsCreateServer(
          mock.fn(() => {
            throw new Error('Should not be used.');
          }),
        ),
      );
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const port = 12345;

      let caughtError: Error | undefined;
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error as Error;
      }

      assert.ok(caughtError instanceof ReceiverInconsistentStateError);
      assert.strictEqual(caughtError.code, ErrorCode.ReceiverInconsistentStateError);
    });
    it('should reject with an error when starting and the server was already previously started', async () => {
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const port = 12345;

      let caughtError: Error | undefined;
      await receiver.start(port);
      try {
        await receiver.start(port);
      } catch (error) {
        caughtError = error as Error;
      }

      assert.ok(caughtError instanceof ReceiverInconsistentStateError);
      assert.strictEqual(caughtError.code, ErrorCode.ReceiverInconsistentStateError);
    });
  });

  describe('#stop()', () => {
    it('should stop listening for requests when a built-in HTTP server is already started', async () => {
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const port = 12345;
      await receiver.start(port);

      await receiver.stop();
    });
    it('should reject when a built-in HTTP server is not started', async () => {
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });

      let caughtError: Error | undefined;
      try {
        await receiver.stop();
      } catch (error) {
        caughtError = error as Error;
      }

      assert.ok(caughtError instanceof ReceiverInconsistentStateError);
      assert.strictEqual(caughtError.code, ErrorCode.ReceiverInconsistentStateError);
    });
    it('should reject when a built-in HTTP server raises an error when closing', async () => {
      fakeServer = new FakeServer(
        undefined,
        new Error('this error will be raised by the underlying HTTP server during close()'),
      );
      fakeCreateServer = mock.fn(() => fakeServer);
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateServer),
        withHttpsCreateServer(
          mock.fn(() => {
            throw new Error('Should not be used.');
          }),
        ),
      );
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      await receiver.start(12345);

      let caughtError: Error | undefined;
      try {
        await receiver.stop();
      } catch (error) {
        caughtError = error as Error;
      }

      assert.ok(caughtError instanceof Error);
      assert.equal(caughtError?.message, 'this error will be raised by the underlying HTTP server during close()');
    });
  });

  describe('#requestHandler()', () => {
    const extractRetryNumStub = mock.fn();
    const extractRetryReasonStub = mock.fn();
    const buildNoBodyResponseStub = mock.fn();
    const buildContentResponseStub = mock.fn();
    const processStub = mock.fn<(event: ReceiverEvent) => Promise<unknown>>(() => Promise.resolve({}));
    const ackStub = function ackStub() {};
    ackStub.prototype.bind = function () {
      return this;
    };
    ackStub.prototype.ack = mock.fn();
    beforeEach(() => {
      overrides = mergeOverrides(
        withHttpCreateServer(fakeCreateServer),
        withHttpsCreateServer(
          mock.fn(() => {
            throw new Error('Should not be used.');
          }),
        ),
        { './HTTPResponseAck': { HTTPResponseAck: ackStub } },
        {
          './HTTPModuleFunctions': {
            extractRetryNumFromHTTPRequest: extractRetryNumStub,
            extractRetryReasonFromHTTPRequest: extractRetryReasonStub,
            buildNoBodyResponse: buildNoBodyResponseStub,
            buildContentResponse: buildContentResponseStub,
          },
        },
      );
    });
    afterEach(() => {
      for (const fake of [
        extractRetryNumStub,
        extractRetryReasonStub,
        buildNoBodyResponseStub,
        buildContentResponseStub,
        processStub,
        ackStub.prototype.ack,
      ]) {
        fake.mock.resetCalls();
        fake.mock.restore();
      }
    });
    it('should not build an HTTP response if processBeforeResponse=false', async () => {
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = { send: () => {} } as Response;
      await receiver.requestHandler(req, resp);

      assert.strictEqual(buildContentResponseStub.mock.callCount(), 0);
    });
    it('should build an HTTP response if processBeforeResponse=true', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: TODO: dig in to see what this type actually is supposed to be
      processStub.mock.mockImplementation((event: any) => {
        event.ack.storedResponse = 'something';
        return Promise.resolve({});
      });
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = { send: () => {} } as Response;
      await receiver.requestHandler(req, resp);
      assert.ok(buildContentResponseStub.mock.callCount() > 0);
    });
    it('should throw and build an HTTP 500 response with no body if processEvent raises an uncoded Error or a coded, non-Authorization Error', async () => {
      processStub.mock.mockImplementation(() => Promise.reject(new Error('uh oh')));
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = {
        send: mock.fn(),
        writeHead: mock.fn(),
        end: mock.fn(),
      };
      await receiver.requestHandler(req, resp as unknown as Response);
      assert.deepStrictEqual(resp.writeHead.mock.calls[0].arguments, [500]);
    });
    it('should build an HTTP 401 response with no body and call ack() if processEvent raises a coded AuthorizationError', async () => {
      processStub.mock.mockImplementation(() => Promise.reject(new AuthorizationError('uh oh', new Error())));
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
      const app = Object.assign(mockInstance(App), { processEvent: processStub }) as unknown as App;
      receiver.init(app);

      const req = { body: {} } as Request;
      const resp = {
        send: mock.fn(),
        writeHead: mock.fn(),
        end: mock.fn(),
      };
      await receiver.requestHandler(req, resp as unknown as Response);
      assert.deepStrictEqual(resp.writeHead.mock.calls[0].arguments, [401]);
    });
  });

  describe('oauth support', () => {
    describe('install path route', () => {
      it('should call into installer.handleInstallPath when HTTP GET request hits the install path', async () => {
        const ER = importExpressReceiver(overrides);
        const receiver = new ER({ signingSecret: 'test-secret', clientSecret: '', clientId: '', stateSecret: '' });
        const handleStub = mock.method(receiver.installer as InstallProvider, 'handleInstallPath', () =>
          Promise.resolve(),
        );

        const req = { body: {}, url: 'http://localhost/slack/install', method: 'GET' } as Request;
        const resp = { send: () => {} } as Response;
        const next = mock.fn();
        // biome-ignore lint/suspicious/noExplicitAny: TODO: better way to get a reference to handle? dealing with express internals, unclear
        (receiver.router as any).handle(req, resp, next);

        assert.deepStrictEqual(handleStub.mock.calls[0].arguments.slice(0, 2), [req, resp]);
      });
    });
    describe('redirect path route', () => {
      it('should call installer.handleCallback with callbackOptions when HTTP request hits the redirect URI path and stateVerification=true', async () => {
        const ER = importExpressReceiver(overrides);
        const callbackOptions = {};
        const scopes = ['some'];
        const installerOptions = {
          stateVerification: true,
          callbackOptions,
        };
        const receiver = new ER({
          signingSecret: 'test-secret',
          clientSecret: '',
          clientId: '',
          stateSecret: '',
          scopes,
          installerOptions,
        });
        const handleStub = mock.method(receiver.installer as InstallProvider, 'handleCallback', () =>
          Promise.resolve(),
        );

        const req = { body: {}, url: 'http://localhost/slack/oauth_redirect', method: 'GET' } as Request;
        const resp = { send: () => {} } as Response;
        // biome-ignore lint/suspicious/noExplicitAny: TODO: better way to get a reference to handle? dealing with express internals, unclear
        (receiver.router as any).handle(req, resp, () => {});

        assert.deepStrictEqual(handleStub.mock.calls[0].arguments, [req, resp, callbackOptions]);
      });
      it('should call installer.handleCallback with callbackOptions and installUrlOptions when HTTP request hits the redirect URI path and stateVerification=false', async () => {
        const ER = importExpressReceiver(overrides);
        const callbackOptions = {};
        const scopes = ['some'];
        const installerOptions = {
          stateVerification: false,
          callbackOptions,
        };
        const receiver = new ER({
          signingSecret: 'test-secret',
          clientSecret: '',
          clientId: '',
          stateSecret: '',
          scopes,
          installerOptions,
        });
        const handleStub = mock.method(receiver.installer as InstallProvider, 'handleCallback', () =>
          Promise.resolve(),
        );

        const req = { body: {}, url: 'http://localhost/slack/oauth_redirect', method: 'GET' } as Request;
        const resp = { send: () => {} } as Response;
        // biome-ignore lint/suspicious/noExplicitAny: TODO: better way to get a reference to handle? dealing with express internals, unclear
        (receiver.router as any).handle(req, resp, () => {});

        assert.deepStrictEqual(handleStub.mock.calls[0].arguments.slice(0, 3), [req, resp, callbackOptions]);
        assert.deepStrictEqual(handleStub.mock.calls[0].arguments[3]?.scopes, scopes);
      });
    });
  });

  describe('state management for built-in server', () => {
    it('should be able to start after it was stopped', async () => {
      const ER = importExpressReceiver(overrides);
      const receiver = new ER({ signingSecret: 'test-secret' });
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
          send: mock.fn(),
        };
        const next = mock.fn();
        respondToSslCheck(req, resp as unknown as Response, next);
        assert.ok(resp.send.mock.callCount() > 0);
        assert.strictEqual(next.mock.callCount(), 0);
      });

      it('should work with other requests', async () => {
        const req = { body: { type: 'block_actions' } } as Request;
        const resp = {
          send: mock.fn(),
        };
        const next = mock.fn();
        respondToSslCheck(req, resp as unknown as Response, next);
        assert.strictEqual(resp.send.mock.callCount(), 0);
        assert.ok(next.mock.callCount() > 0);
      });
    });

    describe('url_verification request handler', () => {
      it('should handle valid requests', async () => {
        const req = { body: { type: 'url_verification', challenge: 'this is it' } } as Request;
        const resp = {
          json: mock.fn(),
        };
        const next = mock.fn();
        respondToUrlVerification(req, resp as unknown as Response, next);
        assert.strictEqual(resp.json.mock.calls[0].arguments[0].challenge, 'this is it');
        assert.strictEqual(next.mock.callCount(), 0);
      });

      it('should work with other requests', async () => {
        const req = { body: { ssl_check: 1 } } as Request;
        const resp = {
          json: mock.fn(),
        };
        const next = mock.fn();
        respondToUrlVerification(req, resp as unknown as Response, next);
        assert.strictEqual(resp.json.mock.callCount(), 0);
        assert.ok(next.mock.callCount() > 0);
      });
    });
  });

  describe('verifySignatureAndParseRawBody', () => {
    beforeEach(() => {
      // requestTimestamp = 1531420618 means this timestamp
      mock.timers.enable({ apis: ['Date'], now: new Date('Thu Jul 12 2018 11:36:58 GMT-0700').getTime() });
    });

    afterEach(() => {
      mock.timers.reset();
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
      assert.strictEqual(state.error, undefined);
    });

    it('should verify requests on GCP', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const state: any = {};
      await runWithValidRequest(buildGCPRequest(), state);
      assert.strictEqual(state.error, undefined);
    });

    it('should verify requests on GCP using async signingSecret', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: errors can be anything
      const state: any = {};
      await runWithValidRequest(buildGCPRequest(), state, () => Promise.resolve(signingSecret));
      assert.strictEqual(state.error, undefined);
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
      const next = mock.fn();
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
      const next = mock.fn();
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
      const next = mock.fn();
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
      mock.timers.reset();
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = mock.fn();
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
      const next = mock.fn();
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

    it('should reject an empty signingSecret at request time', async () => {
      try {
        verifySignatureAndParseBody('', body, {
          'x-slack-signature': signature,
          'x-slack-request-timestamp': requestTimestamp,
          'content-type': 'application/x-www-form-urlencoded',
        });
        assert.fail('Expected error to be thrown');
      } catch (e) {
        assert.ok(e instanceof Error);
        assert.match((e as Error).message, /signingSecret is empty or undefined/);
      }
    });

    // ----------------------------
    // request body size limiting

    function buildLargeExpressRequest(size: number): Request {
      const reqAsStream = new Readable();
      reqAsStream.push('x'.repeat(size));
      reqAsStream.push(null); // indicate EOF
      // biome-ignore lint/suspicious/noExplicitAny: requests can be anything
      (reqAsStream as any).headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };
      return reqAsStream as Request;
    }

    it('should respond 413 when the request body exceeds the configured bodyLimit', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock response capture can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = mock.fn();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret, 128);
      await verifier(buildLargeExpressRequest(1024), resp, next);
      assert.equal(result.code, 413);
      assert.equal(result.sent, true);
      assert.strictEqual(next.mock.callCount(), 0);
    });

    it('should verify a request whose body is within the configured bodyLimit', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock response capture can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = mock.fn();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret, 4096);
      await verifier(buildExpressRequest(), resp, next);
      // On success the middleware calls next() with no error and sends no response.
      assert.strictEqual(next.mock.callCount(), 1);
      assert.strictEqual(next.mock.calls[0].arguments[0], undefined);
      assert.strictEqual(result.code, undefined);
    });

    it('should parse a string bodyLimit and respond 413 when the body exceeds it', async () => {
      // biome-ignore lint/suspicious/noExplicitAny: mock response capture can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = mock.fn();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret, '128b');
      await verifier(buildLargeExpressRequest(1024), resp, next);
      assert.equal(result.code, 413);
      assert.equal(result.sent, true);
      assert.strictEqual(next.mock.callCount(), 0);
    });

    it('should not enforce any limit when bodyLimit is Infinity', async () => {
      // A validly-signed request within Infinity passes size and signature checks and calls next().
      // biome-ignore lint/suspicious/noExplicitAny: mock response capture can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const next = mock.fn();
      const verifier = verifySignatureAndParseRawBody(noopLogger, signingSecret, Infinity);
      await verifier(buildExpressRequest(), resp, next);
      assert.strictEqual(next.mock.callCount(), 1);
      assert.strictEqual(next.mock.calls[0].arguments[0], undefined);
      assert.strictEqual(result.code, undefined);
    });
  });

  describe('buildBodyParserMiddleware', () => {
    // biome-ignore lint/suspicious/noExplicitAny: requests can be anything when testing
    let req: any = { body: {}, headers: { 'content-type': 'application/json' } };
    const res = { send: mock.fn() };
    const next = mock.fn();
    beforeEach(() => {
      req = { body: {}, headers: { 'content-type': 'application/json' } };
      res.send.mock.resetCalls();
      next.mock.resetCalls();
    });
    it('should JSON.parse a stringified rawBody if exists on a application/json request', async () => {
      req.rawBody = '{"awesome": true}';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      assert.ok(next.mock.callCount() > 0);
      assert.equal(req.body.awesome, true, 'request body JSON was not parsed');
    });
    it('should querystring.parse a stringified rawBody if exists on a application/x-www-form-urlencoded request', async () => {
      req.headers['content-type'] = 'application/x-www-form-urlencoded';
      req.rawBody = 'awesome=true';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      assert.ok(next.mock.callCount() > 0);
      assert.equal(req.body.awesome, 'true', 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a stringified rawBody payload if exists on a application/x-www-form-urlencoded request', async () => {
      req.headers['content-type'] = 'application/x-www-form-urlencoded';
      req.rawBody = 'payload=%7B%22awesome%22:true%7D';
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      assert.ok(next.mock.callCount() > 0);
      assert.equal(req.body.awesome, true, 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a body if exists on a application/json request', async () => {
      req = new Readable();
      req.push('{"awesome": true}');
      req.push(null);
      req.headers = { 'content-type': 'application/json' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      assert.ok(next.mock.callCount() > 0);
      assert.equal(req.body.awesome, true, 'request body JSON was not parsed');
    });
    it('should querystring.parse a body if exists on a application/x-www-form-urlencoded request', async () => {
      req = new Readable();
      req.push('awesome=true');
      req.push(null);
      req.headers = { 'content-type': 'application/x-www-form-urlencoded' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      assert(next.mock.callCount() > 0, 'next() was not called');
      assert.equal(req.body.awesome, 'true', 'request body form-urlencoded was not parsed');
    });
    it('should JSON.parse a body payload if exists on a application/x-www-form-urlencoded request', async () => {
      req = new Readable();
      req.push('payload=%7B%22awesome%22:true%7D');
      req.push(null);
      req.headers = { 'content-type': 'application/x-www-form-urlencoded' };
      const parser = buildBodyParserMiddleware(createFakeLogger());
      await parser(req, res as unknown as Response, next);
      assert.ok(next.mock.callCount() > 0);
      assert.equal(req.body.awesome, true, 'request body form-urlencoded was not parsed');
    });
    it('should respond 413 when the request body exceeds bodyLimit', async () => {
      req = new Readable();
      req.push('x'.repeat(1024));
      req.push(null); // indicate EOF
      req.headers = { 'content-type': 'application/json' };
      // biome-ignore lint/suspicious/noExplicitAny: mock response capture can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const parser = buildBodyParserMiddleware(createFakeLogger(), 128);
      await parser(req, resp, next);
      assert.equal(result.code, 413);
      assert.equal(result.sent, true);
      assert.strictEqual(next.mock.callCount(), 0);
    });
    it('should parse a string bodyLimit and respond 413 when the body exceeds it', async () => {
      req = new Readable();
      req.push('x'.repeat(1024));
      req.push(null); // indicate EOF
      req.headers = { 'content-type': 'application/json' };
      // biome-ignore lint/suspicious/noExplicitAny: mock response capture can be anything
      const result: any = {};
      const resp = buildResponseToVerify(result);
      const parser = buildBodyParserMiddleware(createFakeLogger(), '128b');
      await parser(req, resp, next);
      assert.equal(result.code, 413);
      assert.equal(result.sent, true);
      assert.strictEqual(next.mock.callCount(), 0);
    });
    it('should not enforce any limit when bodyLimit is Infinity', async () => {
      req = new Readable();
      req.push(`a=${'x'.repeat(5000)}`); // large, but valid form body
      req.push(null); // indicate EOF
      req.headers = { 'content-type': 'application/x-www-form-urlencoded' };
      const parser = buildBodyParserMiddleware(createFakeLogger(), Infinity);
      await parser(req, res as unknown as Response, next);
      assert.ok(next.mock.callCount() > 0);
      assert.equal(req.body.a, 'x'.repeat(5000), 'large body was parsed without hitting a limit');
    });
  });
});
