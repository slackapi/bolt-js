import rewiremock from 'rewiremock';
import type { WebClientOptions } from '@slack/web-api';
import sinon, { type SinonSpy } from 'sinon';

/*
 * Contains test helpers related to importing, mocking and overriding parts of the App class
 */

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

/**
 * Helps with importing the App class and overriding certain aspects of it, like its setting of request metadata and ensuring the API client within doesnt issue network requests.
 */
export async function importApp(
  overrides: Override = mergeOverrides(withNoopAppMetadata(), withNoopWebClient()),
): Promise<typeof import('../../../src/App').default> {
  return (await rewiremock.module(() => import('../../../src/App'), overrides)).default;
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

export function withPostMessage(spy: SinonSpy): Override {
  return {
    '@slack/web-api': {
      WebClient: class {
        public chat = {
          postMessage: spy,
        };
      },
    },
  };
}

export function withAxiosPost(spy: SinonSpy): Override {
  return {
    axios: {
      create: () => ({
        post: spy,
      }),
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
          test: sinon.fake.resolves({ user_id: botUserId }),
        };

        public users = {
          info: sinon.fake.resolves({
            user: {
              profile: {
                bot_id: botId,
              },
            },
          }),
        };
      },
    },
  };
}
