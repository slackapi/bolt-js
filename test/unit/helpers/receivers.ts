import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import sinon, { type SinonSpy } from 'sinon';
import type App from '../../../src/App';
import type { Receiver, ReceiverEvent } from '../../../src/types';
import type { Override } from './app';

export class FakeReceiver implements Receiver {
  private bolt: App | undefined;

  public init = (bolt: App) => {
    this.bolt = bolt;
  };

  public start = sinon.fake(
    (...params: Parameters<typeof App.prototype.start>): Promise<unknown> => Promise.resolve([...params]),
  );

  public stop = sinon.fake(
    (...params: Parameters<typeof App.prototype.start>): Promise<unknown> => Promise.resolve([...params]),
  );

  public async sendEvent(event: ReceiverEvent): Promise<void> {
    return this.bolt?.processEvent(event);
  }
}

export class FakeServer extends EventEmitter {
  public on = sinon.fake();

  public listen = sinon.fake((_opts: Record<string, unknown>, cb: () => void) => {
    if (this.listeningFailure !== undefined) {
      this.emit('error', this.listeningFailure);
    }
    if (cb) cb();
  });

  // biome-ignore lint/suspicious/noExplicitAny: event handlers could accept anything as parameters
  public close = sinon.fake((...args: any[]) => {
    setImmediate(() => {
      this.emit('close');
      setImmediate(() => {
        args[0](this.closingFailure);
      });
    });
  });

  public constructor(
    private listeningFailure?: Error,
    private closingFailure?: Error,
  ) {
    super();
  }
}
export function withHttpCreateServer(spy: SinonSpy): Override {
  return {
    'node:http': {
      createServer: spy,
    },
  };
}

export function withHttpsCreateServer(spy: SinonSpy): Override {
  return {
    'node:https': {
      createServer: spy,
    },
  };
}

export function createDummyAWSPayload(
  // biome-ignore lint/suspicious/noExplicitAny: HTTP request bodies can be anything
  body: any,
  timestamp: number = Math.floor(Date.now() / 1000),
  headers?: Record<string, string>,
  isBase64Encoded = false,
) {
  const signature = crypto.createHmac('sha256', 'my-secret').update(`v0:${timestamp}:${body}`).digest('hex');
  const realBody = isBase64Encoded ? Buffer.from(body).toString('base64') : body;
  return {
    resource: '/slack/events',
    path: '/slack/events',
    httpMethod: 'POST',
    headers: headers || {
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
    body: realBody,
    isBase64Encoded,
  };
}
