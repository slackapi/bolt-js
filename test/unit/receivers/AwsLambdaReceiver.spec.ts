import crypto from 'node:crypto';
import { assert } from 'chai';
import sinon from 'sinon';
import AwsLambdaReceiver from '../../../src/receivers/AwsLambdaReceiver';
import {
  createDummyAWSPayload,
  createDummyAppMentionEventMiddlewareArgs,
  createFakeLogger,
  importApp,
  mergeOverrides,
  noopVoid,
  withNoopAppMetadata,
  withNoopWebClient,
} from '../helpers';

const fakeAuthTestResponse = {
  ok: true,
  enterprise_id: 'E111',
  team_id: 'T111',
  bot_id: 'B111',
  user_id: 'W111',
};
const appOverrides = mergeOverrides(withNoopAppMetadata(), withNoopWebClient(fakeAuthTestResponse));

describe('AwsLambdaReceiver', () => {
  const noopLogger = createFakeLogger();

  it('should instantiate with default logger', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    assert.isNotNull(awsReceiver);
  });

  it('should have start method', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const startedHandler = await awsReceiver.start();
    assert.isNotNull(startedHandler);
  });

  it('should have stop method', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    await awsReceiver.start();
    await awsReceiver.stop();
  });

  it('should return a 404 if app has no registered handlers for an incoming event, and return a 200 if app does have registered handlers', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const args = createDummyAppMentionEventMiddlewareArgs();
    const body = JSON.stringify(args.body);
    const awsEvent = createDummyAWSPayload(body, timestamp);
    const response1 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response1.statusCode, 404);
    const App = await importApp(appOverrides);
    const app = new App({
      token: 'xoxb-',
      receiver: awsReceiver,
    });
    app.event('app_mention', noopVoid);
    const response2 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response2.statusCode, 200);
  });

  it('should accept proxy events with lowercase header properties', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const args = createDummyAppMentionEventMiddlewareArgs();
    const body = JSON.stringify(args.body);
    const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
    const awsEvent = createDummyAWSPayload(body, timestamp, {
      accept: 'application/json,*/*',
      'content-type': 'application/json',
      host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
      'user-agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
      'x-slack-request-timestamp': `${timestamp}`,
      'x-slack-signature': `v0=${signature}`,
    });
    const response1 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response1.statusCode, 404);
    const App = await importApp(appOverrides);
    const app = new App({
      token: 'xoxb-',
      receiver: awsReceiver,
    });
    app.event('app_mention', noopVoid);
    const response2 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response2.statusCode, 200);
  });

  it('should accept interactivity requests as form-encoded payload', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const body =
      'payload=%7B%22type%22%3A%22shortcut%22%2C%22token%22%3A%22fixed-value%22%2C%22action_ts%22%3A%221612879511.716075%22%2C%22team%22%3A%7B%22id%22%3A%22T111%22%2C%22domain%22%3A%22domain-value%22%2C%22enterprise_id%22%3A%22E111%22%2C%22enterprise_name%22%3A%22Sandbox+Org%22%7D%2C%22user%22%3A%7B%22id%22%3A%22W111%22%2C%22username%22%3A%22primary-owner%22%2C%22team_id%22%3A%22T111%22%7D%2C%22is_enterprise_install%22%3Afalse%2C%22enterprise%22%3A%7B%22id%22%3A%22E111%22%2C%22name%22%3A%22Kaz+SDK+Sandbox+Org%22%7D%2C%22callback_id%22%3A%22bolt-js-aws-lambda-shortcut%22%2C%22trigger_id%22%3A%22111.222.xxx%22%7D';
    const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
    const awsEvent = createDummyAWSPayload(body, timestamp, {
      Accept: 'application/json,*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
      'X-Slack-Request-Timestamp': `${timestamp}`,
      'X-Slack-Signature': `v0=${signature}`,
    });
    const response1 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response1.statusCode, 404);
    const App = await importApp(appOverrides);
    const app = new App({
      token: 'xoxb-',
      receiver: awsReceiver,
    });
    app.shortcut('bolt-js-aws-lambda-shortcut', async ({ ack }) => {
      await ack();
    });
    const response2 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response2.statusCode, 200);
  });

  it('should accept slash commands with form-encoded body', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const body =
      'token=fixed-value&team_id=T111&team_domain=domain-value&channel_id=C111&channel_name=random&user_id=W111&user_name=primary-owner&command=%2Fhello-bolt-js&text=&api_app_id=A111&is_enterprise_install=false&enterprise_id=E111&enterprise_name=Sandbox+Org&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT111%2F111%2Fxxx&trigger_id=111.222.xxx';
    const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
    const awsEvent = createDummyAWSPayload(body, timestamp, {
      Accept: 'application/json,*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
      'X-Slack-Request-Timestamp': `${timestamp}`,
      'X-Slack-Signature': `v0=${signature}`,
    });
    const response1 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response1.statusCode, 404);
    const App = await importApp(appOverrides);
    const app = new App({
      token: 'xoxb-',
      receiver: awsReceiver,
    });
    app.command('/hello-bolt-js', async ({ ack }) => {
      await ack();
    });
    const response2 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response2.statusCode, 200);
  });

  it('should accept an event containing a base64 encoded body', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const args = createDummyAppMentionEventMiddlewareArgs();
    const body = JSON.stringify(args.body);
    const awsEvent = createDummyAWSPayload(body, timestamp, undefined, true);
    const response1 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response1.statusCode, 404);
  });

  it('should accept ssl_check requests', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const body = 'ssl_check=1&token=legacy-fixed-token';
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
    const awsEvent = createDummyAWSPayload(body, timestamp, {
      Accept: 'application/json,*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
      'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
      'X-Slack-Request-Timestamp': `${timestamp}`,
      'X-Slack-Signature': `v0=${signature}`,
    });
    const response = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response.statusCode, 200);
  });

  const urlVerificationBody = JSON.stringify({
    token: 'Jhj5dZrVaK7ZwHHjRyZWjbDl',
    challenge: '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P',
    type: 'url_verification',
  });

  it('should accept url_verification requests', async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const awsEvent = createDummyAWSPayload(urlVerificationBody, timestamp);
    const response = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response.statusCode, 200);
  });

  it('should detect invalid signature', async () => {
    const spy = sinon.spy();
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
      invalidRequestSignatureHandler: spy,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', 'my-secret')
      .update(`v0:${timestamp}:${urlVerificationBody}`)
      .digest('hex');
    const awsEvent = {
      resource: '/slack/events',
      path: '/slack/events',
      httpMethod: 'POST',
      headers: {
        Accept: 'application/json,*/*',
        'Content-Type': 'application/json',
        Host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
        'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
        'X-Slack-Request-Timestamp': `${timestamp}`,
        'X-Slack-Signature': `v0=${signature}XXXXXXXX`, // invalid signature
      },
      multiValueHeaders: {},
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      pathParameters: null,
      stageVariables: null,
      requestContext: {},
      body: urlVerificationBody,
      isBase64Encoded: false,
    };
    const response = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response.statusCode, 401);
    assert(spy.calledOnce);
  });

  it('should detect too old request timestamp', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: 'my-secret',
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const awsEvent = createDummyAWSPayload(urlVerificationBody, timestamp);
    const response = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response.statusCode, 401);
  });

  it('does not perform signature verification if signature verification flag is set to false', async () => {
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: '',
      signatureVerification: false,
      logger: noopLogger,
    });
    const handler = awsReceiver.toHandler();
    const awsEvent = createDummyAWSPayload(urlVerificationBody);
    const response = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response.statusCode, 200);
  });

  it('should not log an error regarding ack timeout if app has no handlers registered', async () => {
    const delay = 10;
    const awsReceiver = new AwsLambdaReceiver({
      signingSecret: '',
      signatureVerification: false,
      logger: noopLogger,
      unhandledRequestTimeoutMillis: delay,
    });
    const handler = awsReceiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const args = createDummyAppMentionEventMiddlewareArgs();
    const body = JSON.stringify(args.body);
    const awsEvent = createDummyAWSPayload(body, timestamp);
    const response1 = await handler(awsEvent, {}, (_error, _result) => {});
    assert.equal(response1.statusCode, 404);
    await new Promise((res) => {
      setTimeout(res, delay + 2);
    });
    sinon.assert.notCalled(awsReceiver.logger.error as sinon.SinonSpy);
  });
});
