import {
  Middleware,
  Context,
  AnyMiddlewareArgs,
  NextMiddleware,
  PostProcessFn,
} from '../types';
import { WebClient } from '@slack/web-api';
import { Logger } from '@slack/logger';

// TODO: what happens if an error is thrown inside a middleware/listener function? it should propagate up and eventually
// be dealt with by the global error handler
export function processMiddleware(
  initialArguments: AnyMiddlewareArgs,
  middleware: Middleware<AnyMiddlewareArgs>[],
  afterMiddleware: (context: Context, args: AnyMiddlewareArgs, startBubble: (error?: Error) => void) => void,
  afterPostProcess: (error?: Error) => void,
  context: Context = {},
  logger: Logger,
  client: WebClient,
): void {

  // Generate next()
  let middlewareIndex = 0;
  const postProcessFns: PostProcessFn[] = [];

  const next: NextMiddleware = (
    errorOrPostProcess?: (Error | PostProcessFn),
  ) => {
    middlewareIndex += 1;
    const thisMiddleware = middleware[middlewareIndex];

    // Continue processing
    if (thisMiddleware !== undefined && !(errorOrPostProcess instanceof Error)) {
      const isLastMiddleware = middlewareIndex === (middleware.length - 1);
      const nextWhenNotLast = isLastMiddleware ? noop : next;

      // In this condition, errorOrPostProcess will be a postProcess function or undefined
      postProcessFns[middlewareIndex - 1] = errorOrPostProcess === undefined ? noopPostProcess : errorOrPostProcess;
      thisMiddleware({ context, logger, client, next: nextWhenNotLast, ...initialArguments });

      if (isLastMiddleware) {
        postProcessFns[middlewareIndex] = noopPostProcess;
        process.nextTick(next);
      }
      return;
    }

    // Processing is complete, and we should begin bubbling up
    // there's no next middleware or the argument is an error

    function createDone(initialIndex: number): (error?: Error) => void {
      let postProcessIndex = initialIndex;

      // done is a function that handles bubbling up in a similar way to next handling propogating down
      const done = (error?: Error): void => {
        postProcessIndex -= 1;

        const thisPostProcess = postProcessFns[postProcessIndex];

        if (thisPostProcess !== undefined) {
          thisPostProcess(error, done);
          return;
        }

        afterPostProcess(error);
      };
      return done;
    }

    if (thisMiddleware === undefined) {
      afterMiddleware(context, initialArguments, (error?: Error) => {
        createDone(middleware.length)(error);
      });
    } else {
      createDone(middlewareIndex - 1)(errorOrPostProcess as Error);
    }

  };

  const firstMiddleware = middleware[0];
  firstMiddleware({ context, logger, client, next, ...initialArguments });
}

function noop(): void { } // tslint:disable-line:no-empty
const noopPostProcess: PostProcessFn = (error, done) => { done(error); };
