import * as crypto from 'node:crypto';
import type { ExecutionContext } from '@cloudflare/workers-types';
import { assert } from 'chai';
import sinon from 'sinon';
import CloudflareReceiver from '../../../src/receivers/CloudflareWorkerReceiver';
import {
  createDummyAppMentionEventMiddlewareArgs,
  createDummyCommandMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noopVoid,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../helpers';

// Helper function to create a dummy Cloudflare Request object
function createDummyCloudflareRequest(
  body: string,
  timestamp: number,
  signingSecret: string,
  headers: Record<string, string> = {},
  method = 'POST',
  url = 'https://example.com/slack/events',
): Request {
  const signature = crypto.createHmac('sha256', signingSecret).update(`v0:${timestamp}:${body}`).digest('hex');
  const defaultHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'x-slack-request-timestamp': String(timestamp),
    'x-slack-signature': `v0=${signature}`,
    ...headers,
  };
  return new Request(url, {
    method,
    headers: defaultHeaders,
    body: body,
  });
}

const fakeAuthTestResponse = {
  ok: true,
  enterprise_id: 'E111',
  team_id: 'T111',
  bot_id: 'B111',
  user_id: 'W111',
};
const appOverrides = mergeOverrides(withNoopAppMetadata(), withNoopWebClient(fakeAuthTestResponse));

describe('CloudflareReceiver', () => {
  let sandbox: sinon.SinonSandbox;
  let mockExecutionContext: ExecutionContext;
  const signingSecret = 'my-secret';
  const noopLogger = createFakeLogger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockExecutionContext = {
      waitUntil: sandbox.stub(),
      passThroughOnException: sandbox.stub(),
      props: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should instantiate with default logger', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    assert.isNotNull(cfReceiver);
  });

  it('should have start method', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    const startedHandler = await cfReceiver.start();
    assert.isNotNull(startedHandler);
  });

  it('should have stop method', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    await cfReceiver.start();
    await cfReceiver.stop();
  });

  it('should return a 404 if app has no registered handlers, and 200 if it does', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    const handler = cfReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const args = createDummyAppMentionEventMiddlewareArgs();
    const body = JSON.stringify(args.body);
    const request1 = createDummyCloudflareRequest(body, timestamp, signingSecret);
    const response1 = await handler(request1, {}, mockExecutionContext);
    assert.equal(response1.status, 404);

    const App = await importApp(appOverrides);
    const app = new App({
      token: 'xoxb-',
      receiver: cfReceiver,
    });
    app.event('app_mention', noopVoid);
    const request2 = createDummyCloudflareRequest(body, timestamp, signingSecret);
    const response2 = await handler(request2, {}, mockExecutionContext);
    assert.equal(response2.status, 200);
  });

  it('should accept interactivity requests as form-encoded payload', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    const handler = cfReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const body =
      'payload=%7B%22type%22%3A%22shortcut%22%2C%22token%22%3A%22fixed-value%22%2C%22action_ts%22%3A%221612879511.716075%22%2C%22team%22%3A%7B%22id%22%3A%22T111%22%2C%22domain%22%3A%22domain-value%22%2C%22enterprise_id%22%3A%22E111%22%2C%22enterprise_name%22%3A%22Sandbox+Org%22%7D%2C%22user%22%3A%7B%22id%22%3A%22W111%22%2C%22username%22%3A%22primary-owner%22%2C%22team_id%22%3A%22T111%22%7D%2C%22is_enterprise_install%22%3Afalse%2C%22enterprise%22%3A%7B%22id%22%3A%22E111%22%2C%22name%22%3A%22Kaz+SDK+Sandbox+Org%22%7D%2C%22callback_id%22%3A%22bolt-js-cloudflare-shortcut%22%2C%22trigger_id%22%3A%22111.222.xxx%22%7D';
    const headers = {
      Accept: 'application/json,*/*',
      'content-type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
    };
    const request1 = createDummyCloudflareRequest(body, timestamp, signingSecret, headers);
    const response1 = await handler(request1, {}, mockExecutionContext);
    assert.equal(response1.status, 404);

    const App = await importApp(appOverrides);
    const app = new App({
      token: 'xoxb-',
      receiver: cfReceiver,
    });
    app.shortcut('bolt-js-cloudflare-shortcut', async ({ ack }) => {
      await ack();
    });
    const request2 = createDummyCloudflareRequest(body, timestamp, signingSecret, headers);
    const response2 = await handler(request2, {}, mockExecutionContext);
    assert.equal(response2.status, 200);
  });

  it('should accept slash commands with form-encoded body', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    const handler = cfReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const body =
      'token=fixed-value&team_id=T111&team_domain=domain-value&channel_id=C111&channel_name=random&user_id=W111&user_name=primary-owner&command=%2Fhello-bolt-js-cloudflare&text=&api_app_id=A111&is_enterprise_install=false&enterprise_id=E111&enterprise_name=Sandbox+Org&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT111%2F111%2Fxxx&trigger_id=111.222.xxx';
    const headers = {
      Accept: 'application/json,*/*',
      'content-type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
    };
    const request1 = createDummyCloudflareRequest(body, timestamp, signingSecret, headers);
    const response1 = await handler(request1, {}, mockExecutionContext);
    assert.equal(response1.status, 404);

    const App = await importApp(appOverrides);
    const app = new App({
      token: 'xoxb-',
      receiver: cfReceiver,
    });
    app.command('/hello-bolt-js-cloudflare', async ({ ack }) => {
      await ack();
    });
    const request2 = createDummyCloudflareRequest(body, timestamp, signingSecret, headers);
    const response2 = await handler(request2, {}, mockExecutionContext);
    assert.equal(response2.status, 200);
  });

  it('should accept ssl_check requests', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    const handler = cfReceiver.toHandler();
    const body = 'ssl_check=1&token=legacy-fixed-token';
    const timestamp = Math.floor(Date.now() / 1000);
    const headers = {
      Accept: 'application/json,*/*',
      'content-type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
    };
    const request = createDummyCloudflareRequest(body, timestamp, signingSecret, headers);
    const response = await handler(request, {}, mockExecutionContext);
    assert.equal(response.status, 200);
  });

  const urlVerificationBody = JSON.stringify({
    token: 'Jhj5dZrVaK7ZwHHjRyZWjbDl',
    challenge: '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P',
    type: 'url_verification',
  });

  it('should accept url_verification requests', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    const handler = cfReceiver.toHandler();
    const request = createDummyCloudflareRequest(urlVerificationBody, timestamp, signingSecret, {
      'content-type': 'application/json',
    });
    const response = await handler(request, {}, mockExecutionContext);
    assert.equal(response.status, 200);
    const responseBody = await response.json();
    assert.deepEqual(responseBody, { challenge: '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P' });
  });

  it('should detect invalid signature', async () => {
    const spy = sinon.spy();
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
      invalidRequestSignatureHandler: spy,
    });
    const handler = cfReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', 'my-secret')
      .update(`v0:${timestamp}:${urlVerificationBody}`)
      .digest('hex');
    const headers = {
      Accept: 'application/json,*/*',
      'Content-Type': 'application/json',
      Host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
      'X-Slack-Request-Timestamp': `${timestamp}`,
      'X-Slack-Signature': `v0=${signature}XXXXXXXX`, // invalid signature
    };
    const request = new Request('https://example.com/slack/events', {
      method: 'POST',
      headers: headers,
      body: urlVerificationBody,
    });
    const response = await handler(request, {}, mockExecutionContext);
    assert.equal(response.status, 401);
    assert(spy.calledOnce);
  });

  it('should detect too old request timestamp', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret,
      logger: noopLogger,
    });
    const handler = cfReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const request = createDummyCloudflareRequest(urlVerificationBody, timestamp, signingSecret, {
      'content-type': 'application/json',
    });
    const response = await handler(request, {}, mockExecutionContext);
    assert.equal(response.status, 401);
  });

  it('does not perform signature verification if signature verification flag is set to false', async () => {
    const cfReceiver = new CloudflareReceiver({
      signingSecret: '', // Provide empty secret
      signatureVerification: false,
      logger: noopLogger,
    });
    const handler = cfReceiver.toHandler();
    // Create request without valid signature headers
    const request = new Request('https://example.com/slack/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: urlVerificationBody,
    });
    const response = await handler(request, {}, mockExecutionContext);
    assert.equal(response.status, 200); // Expect 200 because verification is off
    const responseBody = await response.json();
    assert.deepEqual(responseBody, { challenge: '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P' });
  });

  it('should not log an error regarding ack timeout if app has no handlers registered', async () => {
    const delay = 10;
    const cfReceiver = new CloudflareReceiver({
      signingSecret: '',
      signatureVerification: false,
      logger: noopLogger,
      unhandledRequestTimeoutMillis: delay,
    });
    const handler = cfReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const args = createDummyAppMentionEventMiddlewareArgs();
    const body = JSON.stringify(args.body);
    const request = createDummyCloudflareRequest(body, timestamp, '', { 'content-type': 'application/json' }); // No signing secret needed
    const response = await handler(request, {}, mockExecutionContext);
    assert.equal(response.status, 404); // No handler registered

    await new Promise((res) => {
      setTimeout(res, delay + 2);
    });

    sinon.assert.notCalled(cfReceiver.logger.error as sinon.SinonSpy);
  });

  describe('processBeforeResponse=true', () => {
    it('should acknowledge the request immediately', async () => {
      const cfReceiver = new CloudflareReceiver({
        signingSecret,
        logger: noopLogger,
        processBeforeResponse: true,
      });
      const handler = cfReceiver.toHandler();
      const timestamp = Math.floor(Date.now() / 1000);
      const args = createDummyCommandMiddlewareArgs();
      const body = JSON.stringify(args.body);
      const request = createDummyCloudflareRequest(body, timestamp, signingSecret);

      const App = await importApp(appOverrides);
      const app = new App({
        token: 'xoxb-',
        receiver: cfReceiver,
      });

      let ackCalled = false;
      app.command('/slash', async ({ ack }) => {
        await ack(); // ack() is called
        ackCalled = true;
      });

      const response = await handler(request, {}, mockExecutionContext);
      assert.equal(response.status, 200);
      assert.isTrue(ackCalled, 'ack() should have been called');
      assert.isFalse(
        (mockExecutionContext.waitUntil as sinon.SinonStub).called,
        'waitUntil should not be called when processBeforeResponse=true',
      );
    });
  });

  describe('processBeforeResponse=false (default)', () => {
    it('should acknowledge the request and process remaining logic via waitUntil', async () => {
      const cfReceiver = new CloudflareReceiver({
        signingSecret,
        logger: noopLogger,
        processBeforeResponse: false, // default
      });
      const handler = cfReceiver.toHandler();
      const timestamp = Math.floor(Date.now() / 1000);
      const args = createDummyCommandMiddlewareArgs();
      const body = JSON.stringify(args.body);
      const request = createDummyCloudflareRequest(body, timestamp, signingSecret);

      const App = await importApp(appOverrides);
      const app = new App({
        token: 'xoxb-',
        receiver: cfReceiver,
      });

      let ackCalled = false;
      let handlerFinished = false;
      app.command('/slash', async ({ ack }) => {
        await ack(); // ack() is called first
        ackCalled = true;
        // Simulate some async work after ack
        await new Promise((resolve) => setTimeout(resolve, 10));
        handlerFinished = true;
      });

      const response = await handler(request, {}, mockExecutionContext);
      assert.equal(response.status, 200);
      assert.isTrue(ackCalled, 'ack() should have been called before handler returned');
      // Since the handler returns upon ack(), handlerFinished should still be false
      assert.isFalse(handlerFinished, 'handler logic after ack should not block the response');
      assert.isTrue(
        (mockExecutionContext.waitUntil as sinon.SinonStub).calledOnce,
        'waitUntil should be called with the remaining promise',
      );

      // Ensure the full handler eventually completes
      const waitedPromise = (mockExecutionContext.waitUntil as sinon.SinonStub).firstCall.args[0];
      await waitedPromise;
      assert.isTrue(handlerFinished, 'Full handler should complete via waitUntil');
    });
  });
});
