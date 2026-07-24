import type { FetchFunction } from '@slack/web-api';
import { RespondError } from '../errors';
import type { RespondArguments, RespondFn } from '../types';

export function createRespond(fetchFn: FetchFunction, responseUrl: string): RespondFn {
  return async (message: string | RespondArguments) => {
    const normalizedArgs: RespondArguments = typeof message === 'string' ? { text: message } : message;
    const response = await fetchFn(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedArgs),
    });
    // fetch resolves regardless of status code.
    // Throw so that failures (e.g. expired response_url, rate limits) reach the app's error handling.
    if (!response.ok) {
      throw new RespondError(
        `Failed to respond to the response_url: ${response.status} ${response.statusText}`,
        response.status,
      );
    }
    return response;
  };
}
