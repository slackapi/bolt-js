import path from 'node:path';
import { mock } from 'node:test';
import type { AuthTestResponse, WebClientOptions } from '@slack/web-api';
import { type MockFn, proxyquire } from './index';

/*
 * Contains test helpers related to importing, mocking and overriding parts of the App class
 */

// biome-ignore lint/suspicious/noExplicitAny: module overrides can be anything
export interface Override extends Record<string, Record<string, any>> {}

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

/**
 * Helps with importing the App class and overriding certain aspects of it, like its setting of request metadata and ensuring the API client within doesnt issue network requests.
 */
export function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata(), withNoopWebClient()),
): typeof import('../../../src/App').default {
  const absolutePath = path.resolve(__dirname, '../../../src/App');
  return proxyquire(absolutePath, overrides).default;
}

// Composable overrides
export function withNoopWebClient(authTestResponse?: AuthTestResponse): Override {
  return {
    '@slack/web-api': {
      WebClient: authTestResponse
        ? class {
            public token?: string;

            public constructor(token?: string, _options?: WebClientOptions) {
              this.token = token;
            }

            public auth = {
              test: mock.fn(async () => authTestResponse),
            };
          }
        : class {
            public token?: string;

            public constructor(token?: string, _options?: WebClientOptions) {
              this.token = token;
            }
          },
    },
  };
}

export function withNoopAppMetadata(): Override {
  return {
    '@slack/web-api': {
      addAppMetadata: mock.fn(),
    },
  };
}

export function withMemoryStore(fake: MockFn): Override {
  return {
    './conversation-store': {
      MemoryStore: fake,
    },
  };
}

export function withConversationContext(fake: MockFn): Override {
  return {
    './conversation-store': {
      conversationContext: fake,
    },
  };
}

export function withPostMessage(fake: MockFn): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public chat = {
          postMessage: fake,
        };
      },
    },
  };
}

export function withChatStream(fake: MockFn): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public chatStream = fake;
      },
    },
  };
}

export function withSetStatus(fake: MockFn): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public assistant = {
          threads: {
            setStatus: fake,
          },
        };
      },
    },
  };
}

export function withSuccessfulBotUserFetchingWebClient(botId: string, botUserId: string): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public token?: string;

        public constructor(token?: string, _options?: WebClientOptions) {
          this.token = token;
        }

        public auth = {
          test: mock.fn(async () => ({ user_id: botUserId })),
        };

        public users = {
          info: mock.fn(async () => ({
            user: {
              profile: {
                bot_id: botId,
              },
            },
          })),
        };
      },
    },
  };
}
