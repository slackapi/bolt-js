import { ConsoleLogger } from '@slack/logger';
import sinon from 'sinon';
import type { ConversationStore } from '../../../src/conversation-store';
import type { NextFn } from '../../../src/types';

export * from './app';
export * from './events';
export * from './receivers';

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
export const noopVoid = (..._args: any[]) => Promise.resolve();
export const noopMiddleware = async ({ next }: { next: NextFn }) => {
  await next();
};

export function createFakeConversationStore(): ConversationStore {
  return {
    get: (_id: string) => Promise.resolve({}),
    // biome-ignore lint/suspicious/noExplicitAny: mocks can be anything
    set: (_id: string, _val: any) => Promise.resolve({}),
  };
}
