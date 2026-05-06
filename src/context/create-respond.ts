import type { FetchFunction } from '@slack/web-api';
import type { RespondArguments } from '../types';

export function createRespond(
  fetchFn: FetchFunction,
  responseUrl: string,
): (response: string | RespondArguments) => Promise<Response> {
  return async (message: string | RespondArguments) => {
    const normalizedArgs: RespondArguments = typeof message === 'string' ? { text: message } : message;
    return fetchFn(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedArgs),
    });
  };
}
