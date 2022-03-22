import {
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  Middleware,
  SlackEventMiddlewareArgs,
} from './types';

/* Types */
export interface SlackFunctionExecutedMiddlewareArgs extends SlackEventMiddlewareArgs<'function_executed'> {
  success: SuccessFn;
  error: ErrorFn;
}

export type AllSlackFunctionExecutedMiddlewareArgs = SlackFunctionExecutedMiddlewareArgs & AllMiddlewareArgs;

/**
 * A Function is a deterministic machine with
 * specified outputs given specific inputs.
 * --
 * You configure a Function's title, inputs, and outputs
 * in your project's manifest.json. If your project contains any
 * functions via app.function, it must have a corresponding
 * manifest.json entries or App will throw an error when attempting to
 * initialize.
 * --
 * Slack will take care of providing inputs to your function
 * via a function_execution event. Bolt handles delivering those
 * to your function in the way you can expect of regular events,
 * messages, shortcuts commands, etc.
 * --
 * When initiating an instance of Function below, you supply the
 * fn you want to process the supplied inputs and what logical
 * conditions determine success or failure in your use case.
 * You must call the supplied utility success with your specified
 * outputs or failure.
 * */
export class Function {
  /**
    * @description The named title of the function
    * Should correspond to manifest.json
    * */
  private fnTitle: string;

  /**
   * @description fn to to process corresponding
   * function_executed event
   */
  private fn: Middleware<SlackEventMiddlewareArgs>;

  public constructor(fnTitle: string, fn: Middleware<SlackEventMiddlewareArgs>) {
    // TODO: Add validation step?
    // validate();
    this.fnTitle = fnTitle;
    this.fn = fn;
  }

  /* Utility */
  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<void> => {
      if (isFunctionExecutedEvent(args) && this.matchesConstraints(args)) {
        return this.run(args);
      }
      return args.next();
    };
  }

  private matchesConstraints(args: AnyMiddlewareArgs): boolean {
    if ('function' in args.payload) {
      return this.fnTitle === args.payload.function.callback_id;
    }
    return false;
  }

  private run = async (args: AnyMiddlewareArgs & AllMiddlewareArgs): Promise<void> => {
    const fnArgs = prepareFnArgs(args);
    this.fn(fnArgs);
  };
}

export function isFunctionExecutedEvent(args: AnyMiddlewareArgs): boolean {
  return args.payload.type === 'function_executed';
}

/**
 * Adds custom utilities success and failure functions to
 * arguments
 * @param args provided arguments
 */
function prepareFnArgs(args: AnyMiddlewareArgs & AllMiddlewareArgs): AllSlackFunctionExecutedMiddlewareArgs {
  const { next: _next, ...subArgs } = args;
  const preparedArgs: any = { ...subArgs };
  preparedArgs.success = createSuccess(preparedArgs);
  preparedArgs.error = createError(preparedArgs);
  return preparedArgs;
}

interface SuccessFn {
  (outputs: Record<string, unknown>): Promise<void>
}
interface ErrorFn {
  (error: string): Promise<void>
}
/**
 * Returns a utility function that is used to call the functions.completeSuccess
 * API endpoint with the provided outputs
*/
function createSuccess(args: any): SuccessFn {
  const { client, event } = args;
  const { function_execution_id } = event;
  // TODO: Support client.functions.completeSuccess in node-slack-sdk
  return (outputs: any) => client.apiCall('functions.completeSuccess', {
    outputs,
    function_execution_id,
  });
}
/**
 * Returns a utility function that is used to call the functions.completeFailure
 * API endpoint with the provided outputs
*/
function createError(args: any): ErrorFn {
  const { client, event } = args;
  const { function_execution_id } = event;
  // TODO: Support client.functions.completeFailure in node-slack-sdk
  // TODO: Review whether to use installed app's bot token to make the api call
  // in the future it is possible that the event payload itself will contain
  // workspace token which should be used instead of the app token
  return (error: string) => client.apiCall('functions.completeError', {
    error,
    function_execution_id,
  });
}
