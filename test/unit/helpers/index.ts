import { type Mock, mock } from 'node:test';
import { ConsoleLogger } from '@slack/logger';
import proxyquire from 'proxyquire';
import type { ConversationStore } from '../../../src/conversation-store';
import type { NextFn } from '../../../src/types';

// Ensure that the module gets loaded fresh every time
proxyquire.noPreserveCache();

export * from './app';
export * from './events';
export * from './receivers';
export { proxyquire };

// biome-ignore lint/suspicious/noExplicitAny: mocked methods accept any arguments
type AnyFunction = (...args: any[]) => any;

export type MockFn = Mock<AnyFunction>;

export type MockedInstance<T> = T & { [K in keyof T]: T[K] extends AnyFunction ? Mock<T[K]> : T[K] };

export function mockInstance<T extends object>(Class: abstract new (...args: never[]) => T): MockedInstance<T> {
  const instance = Object.create(Class.prototype);
  for (let proto = Class.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      const { value } = Object.getOwnPropertyDescriptor(proto, key) ?? {};
      if (key !== 'constructor' && typeof value === 'function' && !Object.hasOwn(instance, key)) {
        instance[key] = mock.fn();
      }
    }
  }
  return instance;
}

export function createFakeLogger() {
  return mockInstance(ConsoleLogger);
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
