import { ConsoleLogger } from '@slack/logger';
import sinon from 'sinon';
import type { NextFn, Receiver, ReceiverEvent } from '../../../src/types';
import type App from '../../../src/App';
import type { ConversationStore } from '../../../src/conversation-store';

export * from './app';

export function createFakeLogger() {
  return sinon.createStubInstance(ConsoleLogger);
}

export function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// biome-ignore lint/suspicious/noExplicitAny: mock function can accept anything
export const noop = (_args: any) => Promise.resolve({});
// biome-ignore lint/suspicious/noExplicitAny: mock function can accept anything
export const noopVoid = (_args: any) => Promise.resolve();
export const noopMiddleware = async ({ next }: { next: NextFn }) => {
  await next();
};

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
// Dummies (values that have no real behavior but pass through the system opaquely)
export function createDummyReceiverEvent(type = 'dummy_event_type'): ReceiverEvent {
  // NOTE: this is a degenerate ReceiverEvent that would successfully pass through the App. it happens to look like a
  // IncomingEventType.Event
  return {
    body: {
      event: {
        type,
      },
    },
    ack: noopVoid,
  };
}

export function createFakeConversationStore(): ConversationStore {
  return {
    get: (_id: string) => Promise.resolve({}),
    // biome-ignore lint/suspicious/noExplicitAny: mocks can be anything
    set: (_id: string, _val: any) => Promise.resolve({}),
  };
}
