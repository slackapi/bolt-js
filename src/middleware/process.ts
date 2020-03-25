import {
  Middleware,
  AnyMiddlewareArgs,
  // MiddlewareContext, ProcessMiddlewareContext,
} from '../types';

function composeMiddleware(middleware: Middleware<AnyMiddlewareArgs>[]): Middleware<AnyMiddlewareArgs> {
  return function (context: ProcessMiddlewareContext<AnyMiddlewareArgs>): Promise<unknown> {
    // last called middleware #
    let index = -1;

    async function dispatch(order: number): Promise<unknown> {
      if (order < index) {
        return Promise.reject(new Error('next() called multiple times'));
      }

      index = order;

      let fn: Middleware<AnyMiddlewareArgs> | undefined  = middleware[order];

      if (order === middleware.length) {
        fn = context.next;
      }

      if (fn === null || fn === undefined) {
        return;
      }

      context.next = dispatch.bind(null, order + 1);

      return fn((context as MiddlewareContext<AnyMiddlewareArgs>));
    }

    return dispatch(0);
  };
}

export async function processMiddleware(
    middleware: Middleware<AnyMiddlewareArgs>[],
    context: ProcessMiddlewareContext<AnyMiddlewareArgs>,
): Promise<unknown> {
  return composeMiddleware(middleware)({
    ...context,
    next: /* istanbul ignore next: Code can't be reached, noop instead of `null` for typing */
        () => Promise.resolve(),
  });
}
