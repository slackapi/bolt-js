import { EventEmitter } from 'node:events';
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
