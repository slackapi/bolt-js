import {
  Middleware,
  AnyMiddlewareArgs,
  NextMiddleware,
  PostProcessFn,
} from './types';

export function process(
  initialArguments: AnyMiddlewareArgs,
  middleware: Middleware<AnyMiddlewareArgs>[],
  finalPostProcess: PostProcessFn,
  context: { [key: string]: any } = {},
): void {

  // Generate next()
  let middlewareIndex = 0;
  const postProcessFns: (PostProcessFn | undefined)[] = [];

  const next: NextMiddleware = (
    errorOrPostProcess?: (Error | PostProcessFn),
  ) => {
    middlewareIndex += 1;
    const thisMiddleware = middleware[middlewareIndex];

    // Continue processing
    if (thisMiddleware !== undefined && !(errorOrPostProcess instanceof Error)) {
      // In this condition, errorOrPostProcess will be a postProcess function or undefined
      postProcessFns[middlewareIndex - 1] = errorOrPostProcess;
      thisMiddleware({ context, next, ...initialArguments });
      return;
    }

    // Processing is complete, and we should begin bubbling up
    const done: () => {};

  };

  const firstMiddleware = middleware[0];
  firstMiddleware({ context, next, ...initialArguments });

  // TODO
  // initialArguments
}
