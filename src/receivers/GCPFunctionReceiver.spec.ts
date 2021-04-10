/* eslint @typescript-eslint/naming-convention: off */
import { Response, Request } from 'express';
import sinon from 'sinon';
import { ConsoleLogger } from '@slack/logger';
import { assert } from 'chai';
import 'mocha';
import { default as GCPFunctionReceiver, isSignatureValid, parseRequestBody } from './GCPFunctionReceiver';
import crypto from 'crypto';
import rewiremock from 'rewiremock';
import { WebClientOptions } from '@slack/web-api';
import { ReceiverMultipleAckError } from '../errors';

function mockResponse() {
  return {
    status: sinon.stub<Parameters<Response['status']>, Response>().returnsThis(),
    send: sinon.stub<Parameters<Response['send']>, Response>().returnsThis(),
    json: sinon.stub<Parameters<Response['json']>, Response>().returnsThis(),
  };
}

function mockInteractionRequest() {
  const timestamp = Math.floor(Date.now() / 1000);
  const body =
    'payload=%7B%22type%22%3A%22shortcut%22%2C%22token%22%3A%22fixed-value%22%2C%22action_ts%22%3A%221612879511.716075%22%2C%22team%22%3A%7B%22id%22%3A%22T111%22%2C%22domain%22%3A%22domain-value%22%2C%22enterprise_id%22%3A%22E111%22%2C%22enterprise_name%22%3A%22Sandbox+Org%22%7D%2C%22user%22%3A%7B%22id%22%3A%22W111%22%2C%22username%22%3A%22primary-owner%22%2C%22team_id%22%3A%22T111%22%7D%2C%22is_enterprise_install%22%3Afalse%2C%22enterprise%22%3A%7B%22id%22%3A%22E111%22%2C%22name%22%3A%22Kaz+SDK+Sandbox+Org%22%7D%2C%22callback_id%22%3A%22bolt-js-aws-lambda-shortcut%22%2C%22trigger_id%22%3A%22111.222.xxx%22%7D';
  const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
  return {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-slack-request-timestamp': `${timestamp}`,
      'x-slack-signature': `v0=${signature}`,
    },
    rawBody: Buffer.from(body),
  };
}

describe('GCPFunctionReceiver', function () {
  it('should instantiate with default logger', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
    });
    assert.instanceOf(receiver.logger, ConsoleLogger);
  });

  it('should have start method', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
    });
    const handler = await receiver.start();
    assert.isNotNull(handler);
  });

  it('should have stop method', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
    });
    assert.isNotOk(await receiver.stop());
  });

  it('should throw if request is missing rawBody', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
    });

    const handler = receiver.toHandler();
    try {
      await handler({} as Request, mockResponse() as any);
    } catch (e) {
      assert.instanceOf(e, Error);
    }
  });

  it('should accept events', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
      logger: sinon.createStubInstance(ConsoleLogger),
    });
    const handler = receiver.toHandler();
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
    const request = {
      headers: {
        'content-type': 'application/json',
        'x-slack-request-timestamp': `${timestamp}`,
        'x-slack-signature': `v0=${signature}`,
      },
      rawBody: Buffer.from(body),
    };
    const response1 = mockResponse();
    await handler(request as any, response1 as any);
    assert.isTrue(response1.status.calledWithExactly(404));
    assert.isTrue(response1.send.calledWithExactly(''));

    const App = await importApp();
    const app = new App({
      token: 'xoxb-',
      receiver: receiver,
    });
    app.event('app_mention', async ({}) => {});
    const response2 = mockResponse();
    await handler(request as any, response2 as any);
    assert.isTrue(response2.send.calledWithExactly(''));
  });

  it('should accept interactivity requests', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: () => 'my-secret',
      logger: sinon.createStubInstance(ConsoleLogger),
    });
    const handler = receiver.toHandler();
    const response1 = mockResponse();
    await handler(mockInteractionRequest() as any, response1 as any);
    assert.isTrue(response1.status.calledWithExactly(404));
    assert.isTrue(response1.send.calledWithExactly(''));
    const App = await importApp();
    const app = new App({
      token: 'xoxb-',
      receiver: receiver,
    });
    app.shortcut('bolt-js-aws-lambda-shortcut', async ({ ack }) => {
      await ack();
    });
    const response2 = mockResponse();
    await handler(mockInteractionRequest() as any, response2 as any);
    assert.isTrue(response2.send.calledWithExactly(''));
  });

  it('should accept slash commands', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: () => Promise.resolve('my-secret'),
      logger: sinon.createStubInstance(ConsoleLogger),
    });
    const handler = receiver.toHandler();
    const timestamp = Math.floor(Date.now() / 1000);
    const body =
      'token=fixed-value&team_id=T111&team_domain=domain-value&channel_id=C111&channel_name=random&user_id=W111&user_name=primary-owner&command=%2Fhello-bolt-js&text=&api_app_id=A111&is_enterprise_install=false&enterprise_id=E111&enterprise_name=Sandbox+Org&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT111%2F111%2Fxxx&trigger_id=111.222.xxx';
    const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
    const request = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-slack-request-timestamp': `${timestamp}`,
        'x-slack-signature': `v0=${signature}`,
      },
      rawBody: Buffer.from(body),
    };
    const response1 = mockResponse();
    await handler(request as any, response1 as any);
    assert.isTrue(response1.status.calledWithExactly(404));
    assert.isTrue(response1.send.calledWithExactly(''));
    const App = await importApp();
    const app = new App({
      token: 'xoxb-',
      receiver: receiver,
    });
    app.command('/hello-bolt-js', async ({ ack }) => {
      await ack('string response');
      try {
        await ack();
      } catch (e) {
        assert.instanceOf(e, ReceiverMultipleAckError);
      }
    });
    const response2 = mockResponse();
    await handler(request as any, response2 as any);
    assert.isTrue(response2.send.calledWithExactly('string response'));
  });

  it('should handle json ack', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
      logger: sinon.createStubInstance(ConsoleLogger),
    });
    const App = await importApp();
    const app = new App({
      token: 'xoxb-',
      receiver: receiver,
    });
    const ackResponse = { ack: true };
    app.shortcut('bolt-js-aws-lambda-shortcut', async ({ ack }) => {
      await ack(ackResponse as any);
    });
    const response1 = mockResponse();
    await receiver.toHandler()(mockInteractionRequest() as any, response1 as any);
    assert.deepEqual(response1.json.firstCall.args[0], ackResponse);
  });

  it('should handle exceptions while processing events', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
      logger: sinon.createStubInstance(ConsoleLogger),
    });
    const App = await importApp();
    const app = new App({
      token: 'xoxb-',
      receiver: receiver,
    });
    app.processEvent = () => {
      throw new Error();
    };
    app.shortcut('bolt-js-aws-lambda-shortcut', async () => {});
    const response1 = mockResponse();
    await receiver.toHandler()(mockInteractionRequest() as any, response1 as any);
    assert.isTrue(response1.status.calledWithExactly(500));
    assert.isTrue(response1.send.calledWithExactly('Internal server error'));
  });

  it('should accept ssl check', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
    });

    const handler = receiver.toHandler();
    const response1 = mockResponse();
    await handler(
      {
        headers: { 'content-type': 'application/json' },
        rawBody: Buffer.from(JSON.stringify({ ssl_check: true })),
      } as any,
      response1 as any,
    );
    assert.isTrue(response1.send.calledWithExactly(''));
  });

  it('should accept url verification', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'my-secret',
    });

    const handler = receiver.toHandler();
    const body = JSON.stringify({ challenge: 'challenge', type: 'url_verification' });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
    const request = {
      headers: {
        'content-type': 'application/json',
        'x-slack-request-timestamp': `${timestamp}`,
        'x-slack-signature': `v0=${signature}`,
      },
      rawBody: Buffer.from(body),
    };
    const response1 = mockResponse();
    await handler(request as any, response1 as any);
    assert.deepEqual(response1.json.firstCall.args[0], { challenge: 'challenge' });
  });

  it('should handle bad signature', async () => {
    const receiver = new GCPFunctionReceiver({
      signingSecret: 'wrong-secret',
      logger: sinon.createStubInstance(ConsoleLogger),
    });

    const handler = receiver.toHandler();
    const body = JSON.stringify({ challenge: 'challenge', type: 'url_verification' });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
    const request = {
      headers: {
        'content-type': 'application/json',
        'x-slack-request-timestamp': `${timestamp}`,
        'x-slack-signature': `v0=${signature}`,
      },
      rawBody: Buffer.from(body),
    };
    const response1 = mockResponse();
    await handler(request as any, response1 as any);
    assert.isTrue(response1.status.calledWithExactly(401));
    assert.isTrue(response1.send.calledWithExactly(''));
  });

  describe('isSignatureValid', () => {
    it('should handle missing signature/timestamp', () => {
      const logger = sinon.createStubInstance(ConsoleLogger);
      assert.isFalse(isSignatureValid('secret', '', undefined, undefined, logger));
      assert.equal(logger.warn.firstCall.args[0], 'request signing verification failed. Some headers are missing.');

      assert.isFalse(isSignatureValid('secret', '', 'signature', undefined, logger));
      assert.equal(logger.warn.secondCall.args[0], 'request signing verification failed. Some headers are missing.');
    });

    it('should handle bad timestamp', () => {
      const logger = sinon.createStubInstance(ConsoleLogger);
      assert.isFalse(isSignatureValid('secret', '', 'signature', 'undefined', logger));
      assert.isTrue(logger.warn.calledWithExactly('request signing verification failed. Timestamp is invalid.'));
    });

    it('should handle expired timestamp', () => {
      const logger = sinon.createStubInstance(ConsoleLogger);
      assert.isFalse(isSignatureValid('secret', '', 'signature', Math.floor(Date.now() / 1000) - 60 * 10, logger));
      assert.isTrue(logger.warn.calledWithExactly('request signing verification failed. Timestamp is too old.'));
    });
  });

  describe('parseRequestBody', () => {
    it('should handle malformed body', () => {
      const logger = sinon.createStubInstance(ConsoleLogger);
      assert.deepEqual(parseRequestBody('"', 'application/json', logger), {});
      assert.isTrue(logger.warn.calledWithExactly('Unable to parse body'));
    });
  });
});

export interface Override {
  [packageName: string]: {
    [exportName: string]: any;
  };
}

export function mergeOverrides(...overrides: Override[]): Override {
  let currentOverrides: Override = {};
  for (const override of overrides) {
    currentOverrides = mergeObjProperties(currentOverrides, override);
  }
  return currentOverrides;
}

function mergeObjProperties(first: Override, second: Override): Override {
  const merged: Override = {};
  const props = Object.keys(first).concat(Object.keys(second));
  for (const prop of props) {
    if (second[prop] === undefined && first[prop] !== undefined) {
      merged[prop] = first[prop];
    } else if (first[prop] === undefined && second[prop] !== undefined) {
      merged[prop] = second[prop];
    } else {
      // second always overwrites the first
      merged[prop] = { ...first[prop], ...second[prop] };
    }
  }
  return merged;
}

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
