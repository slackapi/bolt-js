import {
  Middleware,
  AnyMiddlewareArgs,
  Context,
} from '../types';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/logger';

export async function processMiddleware(
  middleware: Middleware<AnyMiddlewareArgs>[],
  initialArgs: AnyMiddlewareArgs,
  context: Context,
  client: WebClient,
  logger: Logger,
  betweenPhases?: () => Promise<void>,
): Promise<void> {
  let middlewareIndex = 0;

  async function invokeCurrentMiddleware(): ReturnType<Middleware<AnyMiddlewareArgs>> {
    if (middlewareIndex !== middleware.length) {
      const result = await middleware[middlewareIndex]({
        next: invokeCurrentMiddleware,
        ...initialArgs,
        context,
        client,
        logger,
      });
      middlewareIndex += 1;
      return result;
    }

    if (betweenPhases !== undefined) {
      return betweenPhases();
    }
  }

  return invokeCurrentMiddleware();
}
