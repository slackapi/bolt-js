import { createEchoRequester } from '@algolia/client-common';
import type { Requester } from '@algolia/client-common';

export function echoRequester(status: number = 200): Requester {
  return createEchoRequester({ getURL: (url: string) => new URL(url), status });
}
