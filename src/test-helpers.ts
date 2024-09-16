import { ConsoleLogger } from '@slack/logger';
import sinon, { type SinonSpy } from 'sinon';
import type { NextFn, Receiver, ReceiverEvent } from './types';
import type App from './App';

// biome-ignore lint/suspicious/noExplicitAny: module overrides can be anything
export interface Override extends Record<string, Record<string, any>> { }

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
export function withNoopWebClient(): Override {
  return {
    '@slack/web-api': {
      WebClient: class { },
    },
  };
}

export function withNoopAppMetadata(): Override {
  return {
    '@slack/web-api': {
      addAppMetadata: sinon.fake(),
    },
  };
}

export function withMemoryStore(spy: SinonSpy): Override {
  return {
    './conversation-store': {
      MemoryStore: spy,
    },
  };
}

export function withConversationContext(spy: SinonSpy): Override {
  return {
    './conversation-store': {
      conversationContext: spy,
    },
  };
}

export function createFakeLogger() {
  return sinon.createStubInstance(ConsoleLogger);
}

export function delay(ms = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const noop = () => Promise.resolve(undefined);
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
    ack: noop,
  };
}
