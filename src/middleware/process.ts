import type { Logger } from '@slack/logger';
import type { WebClient } from '@slack/web-api';
import type { AnyMiddlewareArgs, Context, Middleware } from '../types';

export default async function processMiddleware(
  middleware: Middleware<AnyMiddlewareArgs>[],
  initialArgs: AnyMiddlewareArgs,
  context: Context,
  client: WebClient,
  logger: Logger,
  last: () => Promise<void>,
): Promise<void> {
  let lastCalledMiddlewareIndex = -1;

  async function invokeMiddleware(toCallMiddlewareIndex: number): ReturnType<Middleware<AnyMiddlewareArgs>> {
    if (lastCalledMiddlewareIndex >= toCallMiddlewareIndex) {
      // TODO: use a coded error
      throw Error('next() called multiple times');
    }

    if (toCallMiddlewareIndex < middleware.length) {
      lastCalledMiddlewareIndex = toCallMiddlewareIndex;
      return middleware[toCallMiddlewareIndex]({
        ...initialArgs,
        next: () => invokeMiddleware(toCallMiddlewareIndex + 1),
        context,
        client,
        logger,
      });
    }

    return last();
  }

  return invokeMiddleware(0);
}
