import type { AuthMode, Headers, QueryParameters } from './types';

export function createAuth(
  appId: string,
  apiKey: string,
  authMode: AuthMode = 'WithinHeaders',
): {
  readonly headers: () => Headers;
  readonly queryParameters: () => QueryParameters;
} {
  const credentials = {
    'x-algolia-api-key': apiKey,
    'x-algolia-application-id': appId,
  };

  return {
    headers(): Headers {
      return authMode === 'WithinHeaders' ? credentials : {};
    },

    queryParameters(): QueryParameters {
      return authMode === 'WithinQueryParameters' ? credentials : {};
    },
  };
}
