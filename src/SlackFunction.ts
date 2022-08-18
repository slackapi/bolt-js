import {
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  Middleware,
  SlackEventMiddlewareArgs,
} from './types';

/* Types */
export interface SlackFunctionExecutedMiddlewareArgs extends SlackEventMiddlewareArgs<'function_executed'> {
  completeSuccess: SuccessFn;
  completeError: ErrorFn;
}

export interface SuccessFn {
  (outputs: Record<string, unknown>): Promise<void>
}
export interface ErrorFn {
  (error: string): Promise<void>
}

export type AllSlackFunctionExecutedMiddlewareArgs = SlackFunctionExecutedMiddlewareArgs & AllMiddlewareArgs;

/**
 * A SlackFunction is a deterministic machine with
 * specified outputs given specific inputs.
 * --
 * Configure a SlackFunction's callback_id, inputs, and outputs
 * in your project's manifest file (json or js). 
 * --
 * Slack will take care of providing inputs to your function
 * via a function_execution event. Bolt handles delivering those
 * to your function in the way you can expect of regular events,
 * messages, shortcuts commands, etc.
 * --
 * When initiating an instance of SlackFunction below, you supply the
 * callback you want to process the supplied inputs and what logical
 * conditions determine success or failure in your use case.
 * Call the supplied utility complete with either outputs or an error
 * */
export class SlackFunction {
  /**
    * @description The callback_id of the function
    * as defined in your manifest file
    * */
  private callbackId: string;

  /**
   * @description fn to to process corresponding
   * function_executed event
   */
  private fn: Middleware<SlackEventMiddlewareArgs>;

  public constructor(callbackId: string, fn: Middleware<SlackEventMiddlewareArgs>) {
    // TODO: Add validation step
    this.callbackId = callbackId;
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
      return this.callbackId === args.payload.function.callback_id;
    }
    return false;
  }

  private run = async (args: AnyMiddlewareArgs & AllMiddlewareArgs): Promise<void> => {
    const fnArgs = prepareFnArgs(args);
    this.fn(fnArgs);
  };
}

function isFunctionExecutedEvent(args: AnyMiddlewareArgs): boolean {
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
  preparedArgs.completeSuccess = createCompleteSuccess(preparedArgs);
  preparedArgs.completeError = createCompleteError(preparedArgs);
  return preparedArgs;
}

/**
 * Returns a utility function that is used to call the functions.completeSuccess
 * API endpoint with the provided outputs
*/
function createCompleteSuccess(args: any): SuccessFn {
  const { client, event } = args;
  const { function_execution_id } = event;
  // TODO: Support client.functions.completeSuccess in node-slack-sdk
  return (outputs: any) => client.apiCall('functions.completeSuccess', {
    outputs,
    function_execution_id,
  });
}
/**
 * Returns a utility function that is used to call the functions.completeError
 * API endpoint with the provided outputs
*/
function createCompleteError(args: any): ErrorFn {
  const { client, event } = args;
  const { function_execution_id } = event;
  // TODO: Support client.functions.completeError in node-slack-sdk
  // TODO: Review whether to use installed app's bot token to make the api call
  // in the future it is possible that the event payload itself will contain
  // workspace token which should be used instead of the app token
  return (error: string) => client.apiCall('functions.completeError', {
    error,
    function_execution_id,
  });
}
