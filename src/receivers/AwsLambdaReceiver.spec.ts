/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/naming-convention */

import sinon from 'sinon';
import { Logger, LogLevel } from '@slack/logger';
import { assert } from 'chai';
import 'mocha';
import crypto from 'crypto';
import rewiremock from 'rewiremock';
import { WebClientOptions } from '@slack/web-api';
import AwsLambdaReceiver, { AwsHandler } from './AwsLambdaReceiver';
import { Override, mergeOverrides } from '../test-helpers';

const noop = () => Promise.resolve(undefined);

describe('AwsLambdaReceiver', function () {
  beforeEach(function () {});

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

  describe('AwsLambdaReceiver', () => {
    it('should instantiate with default logger', async (): Promise<void> => {
      const awsReceiver = new AwsLambdaReceiver({
        signingSecret: 'my-secret',
      });
      assert.isNotNull(awsReceiver);
    });

    it('should have start method', async (): Promise<void> => {
      const awsReceiver = new AwsLambdaReceiver({
        signingSecret: 'my-secret',
      });
      const handler: AwsHandler = await awsReceiver.start();
      assert.isNotNull(handler);
    });

    it('should accept events', async (): Promise<void> => {
      const awsReceiver = new AwsLambdaReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
      });
      const handler = awsReceiver.toHandler();
      const timestamp = Math.floor(Date.now() / 1000);
      const body = JSON.stringify({
        token: 'fixed-value',
        team_id: 'T111',
        enterprise_id: 'E111',
        api_app_id: 'A111',
        event: {
          client_msg_id: '977a7fa8-c9b3-4b51-a0b6-3b6c647e2165',
          type: 'app_mention',
          text: '<@U222> test',
          user: 'W111',
          ts: '1612879521.002100',
          team: 'T111',
          channel: 'C111',
          event_ts: '1612879521.002100',
        },
        type: 'event_callback',
        event_id: 'Ev111',
        event_time: 1612879521,
        authorizations: [
          {
            enterprise_id: 'E111',
            team_id: 'T111',
            user_id: 'W111',
            is_bot: true,
            is_enterprise_install: false,
          },
        ],
        is_ext_shared_channel: false,
        event_context: '1-app_mention-T111-C111',
      });
      const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
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
          'X-Slack-Signature': `v0=${signature}`,
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {},
        body,
        isBase64Encoded: false,
      };
      const response1 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response1.statusCode, 404);
      const App = await importApp();
      const app = new App({
        token: 'xoxb-',
        receiver: awsReceiver,
      });
      app.event('app_mention', noop);
      const response2 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response2.statusCode, 200);
    });

    it('should accept proxy events with lowercase header properties', async (): Promise<void> => {
      const awsReceiver = new AwsLambdaReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
      });
      const handler = awsReceiver.toHandler();
      const timestamp = Math.floor(Date.now() / 1000);
      const body = JSON.stringify({
        token: 'fixed-value',
        team_id: 'T111',
        enterprise_id: 'E111',
        api_app_id: 'A111',
        event: {
          client_msg_id: '977a7fa8-c9b3-4b51-a0b6-3b6c647e2165',
          type: 'app_mention',
          text: '<@U222> test',
          user: 'W111',
          ts: '1612879521.002100',
          team: 'T111',
          channel: 'C111',
          event_ts: '1612879521.002100',
        },
        type: 'event_callback',
        event_id: 'Ev111',
        event_time: 1612879521,
        authorizations: [
          {
            enterprise_id: 'E111',
            team_id: 'T111',
            user_id: 'W111',
            is_bot: true,
            is_enterprise_install: false,
          },
        ],
        is_ext_shared_channel: false,
        event_context: '1-app_mention-T111-C111',
      });
      const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
      const awsEvent = {
        resource: '/slack/events',
        path: '/slack/events',
        httpMethod: 'POST',
        headers: {
          accept: 'application/json,*/*',
          'content-type': 'application/json',
          host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
          'user-agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
          'x-slack-request-timestamp': `${timestamp}`,
          'x-slack-signature': `v0=${signature}`,
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {},
        body,
        isBase64Encoded: false,
      };
      const response1 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response1.statusCode, 404);
      const App = await importApp();
      const app = new App({
        token: 'xoxb-',
        receiver: awsReceiver,
      });
      app.event('app_mention', noop);
      const response2 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response2.statusCode, 200);
    });

    it('should accept interactivity requests', async (): Promise<void> => {
      const awsReceiver = new AwsLambdaReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
      });
      const handler = awsReceiver.toHandler();
      const timestamp = Math.floor(Date.now() / 1000);
      const body =
        'payload=%7B%22type%22%3A%22shortcut%22%2C%22token%22%3A%22fixed-value%22%2C%22action_ts%22%3A%221612879511.716075%22%2C%22team%22%3A%7B%22id%22%3A%22T111%22%2C%22domain%22%3A%22domain-value%22%2C%22enterprise_id%22%3A%22E111%22%2C%22enterprise_name%22%3A%22Sandbox+Org%22%7D%2C%22user%22%3A%7B%22id%22%3A%22W111%22%2C%22username%22%3A%22primary-owner%22%2C%22team_id%22%3A%22T111%22%7D%2C%22is_enterprise_install%22%3Afalse%2C%22enterprise%22%3A%7B%22id%22%3A%22E111%22%2C%22name%22%3A%22Kaz+SDK+Sandbox+Org%22%7D%2C%22callback_id%22%3A%22bolt-js-aws-lambda-shortcut%22%2C%22trigger_id%22%3A%22111.222.xxx%22%7D';
      const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
      const awsEvent = {
        resource: '/slack/events',
        path: '/slack/events',
        httpMethod: 'POST',
        headers: {
          Accept: 'application/json,*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
          'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
          'X-Slack-Request-Timestamp': `${timestamp}`,
          'X-Slack-Signature': `v0=${signature}`,
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {},
        body,
        isBase64Encoded: false,
      };
      const response1 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response1.statusCode, 404);
      const App = await importApp();
      const app = new App({
        token: 'xoxb-',
        receiver: awsReceiver,
      });
      app.shortcut('bolt-js-aws-lambda-shortcut', async ({ ack }) => {
        await ack();
      });
      const response2 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response2.statusCode, 200);
    });

    it('should accept slash commands', async (): Promise<void> => {
      const awsReceiver = new AwsLambdaReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
      });
      const handler = awsReceiver.toHandler();
      const timestamp = Math.floor(Date.now() / 1000);
      const body =
        'token=fixed-value&team_id=T111&team_domain=domain-value&channel_id=C111&channel_name=random&user_id=W111&user_name=primary-owner&command=%2Fhello-bolt-js&text=&api_app_id=A111&is_enterprise_install=false&enterprise_id=E111&enterprise_name=Sandbox+Org&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT111%2F111%2Fxxx&trigger_id=111.222.xxx';
      const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
      const awsEvent = {
        resource: '/slack/events',
        path: '/slack/events',
        httpMethod: 'POST',
        headers: {
          Accept: 'application/json,*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
          Host: 'xxx.execute-api.ap-northeast-1.amazonaws.com',
          'User-Agent': 'Slackbot 1.0 (+https://api.slack.com/robots)',
          'X-Slack-Request-Timestamp': `${timestamp}`,
          'X-Slack-Signature': `v0=${signature}`,
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {},
        body,
        isBase64Encoded: false,
      };
      const response1 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response1.statusCode, 404);
      const App = await importApp();
      const app = new App({
        token: 'xoxb-',
        receiver: awsReceiver,
      });
      app.command('/hello-bolt-js', async ({ ack }) => {
        await ack();
      });
      const response2 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response2.statusCode, 200);
    });

    it('should accept an event containing a base64 encoded body', async () => {
      const awsReceiver = new AwsLambdaReceiver({
        signingSecret: 'my-secret',
        logger: noopLogger,
      });
      const handler = awsReceiver.toHandler();
      const timestamp = Math.floor(Date.now() / 1000);
      const body = JSON.stringify({
        token: 'fixed-value',
        team_id: 'T111',
        enterprise_id: 'E111',
        api_app_id: 'A111',
        event: {
          client_msg_id: '977a7fa8-c9b3-4b51-a0b6-3b6c647e2165',
          type: 'app_mention',
          text: '<@U222> test',
          user: 'W111',
          ts: '1612879521.002100',
          team: 'T111',
          channel: 'C111',
          event_ts: '1612879521.002100',
        },
        type: 'event_callback',
        event_id: 'Ev111',
        event_time: 1612879521,
        authorizations: [
          {
            enterprise_id: 'E111',
            team_id: 'T111',
            user_id: 'W111',
            is_bot: true,
            is_enterprise_install: false,
          },
        ],
        is_ext_shared_channel: false,
        event_context: '1-app_mention-T111-C111',
      });
      const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
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
          'X-Slack-Signature': `v0=${signature}`,
        },
        multiValueHeaders: {},
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        pathParameters: null,
        stageVariables: null,
        requestContext: {},
        body: Buffer.from(body).toString('base64'),
        isBase64Encoded: true,
      };
      const response1 = await handler(
        awsEvent,
        {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_error, _result) => {},
      );
      assert.equal(response1.statusCode, 404);
    });
  });
});

// Composable overrides
function withNoopWebClient(): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public token?: string;

        constructor(token?: string, _options?: WebClientOptions) {
          this.token = token;
        }

        public auth = {
          test: sinon.fake.resolves({
            enterprise_id: 'E111',
            team_id: 'T111',
            bot_id: 'B111',
            user_id: 'W111',
          }),
        };
      },
    },
  };
}

function withNoopAppMetadata(): Override {
  return {
    '@slack/web-api': {
      addAppMetadata: sinon.fake(),
    },
  };
}

// Loading the system under test using overrides
async function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata(), withNoopWebClient()),
): Promise<typeof import('../App').default> {
  return (await rewiremock.module(() => import('../App'), overrides)).default;
}
