import {
  Middleware,
  Context,
  AnyMiddlewareArgs,
  NextMiddleware,
  PostProcessFn,
} from '../types';

// TODO: what happens if an error is thrown inside a middleware/listener function? it should propagate up and eventually
// be dealt with by the global error handler
export async function processMiddleware(
  initialArguments: AnyMiddlewareArgs,
  middleware: Middleware<AnyMiddlewareArgs>[],
  afterMiddleware: (context: Context, args: AnyMiddlewareArgs, startBubble: (error?: Error) => Promise<void>) => Promise<void>,
  afterPostProcess: (error?: Error) => Promise<void>,
  context: Context = {},
): Promise<void> {

  // Generate next()
  let middlewareIndex = 0;
  const postProcessFns: PostProcessFn[] = [];

  const next: NextMiddleware = async (
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
      await thisMiddleware({ context, next: nextWhenNotLast, ...initialArguments });

      if (isLastMiddleware) {
        postProcessFns[middlewareIndex] = noopPostProcess;
        await next();
      }
      return;
    }

    // Processing is complete, and we should begin bubbling up
    // there's no next middleware or the argument is an error
    function createDone(initialIndex: number): (error?: Error) => Promise<void> {
      let postProcessIndex = initialIndex;

      // done is a function that handles bubbling up in a similar way to next handling propogating down
      const done = async (error?: Error): Promise<void> => {
        postProcessIndex -= 1;

        const thisPostProcess = postProcessFns[postProcessIndex];

        if (thisPostProcess !== undefined) {
          await thisPostProcess(error, done);
          return;
        }

        await afterPostProcess(error);
      };
      return done;
    }

    if (thisMiddleware === undefined) {
      await afterMiddleware(context, initialArguments, async (error?: Error) => {
        await createDone(middleware.length)(error);
      });
    } else {
      await createDone(middlewareIndex - 1)(errorOrPostProcess as Error);
    }

  };

  const firstMiddleware = middleware[0];
  await firstMiddleware({ context, next, ...initialArguments });
}

async function noop(): Promise<void> { } // tslint:disable-line:no-empty
const noopPostProcess: PostProcessFn = async (error, done) => { await done(error); };
