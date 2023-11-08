/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  WorkflowsStepCompletedResponse,
  WorkflowsStepFailedResponse,
  // FunctionCompleteErrorResponse,
  // FunctionCompleteSuccessResponse,
} from '@slack/web-api';
import {
  Middleware,
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  SlackEventMiddlewareArgs,
  FunctionExecutedEvent,
} from './types';
import processMiddleware from './middleware/process';
import { WorkflowFunctionInitializationError } from './errors';

/** Interfaces */

export interface FunctionCompleteArguments {
  outputs?: {
    [key: string]: any;
  };
}

export interface FunctionFailArguments {
  error: string;
}

export interface FunctionCompleteFn {
  // TODO :: import FunctionCompleteErrorResponse from @slack/web-api
  (params?: FunctionCompleteArguments): Promise<WorkflowsStepCompletedResponse>;
}

export interface FunctionFailFn {
  // TODO :: import FunctionCompleteErrorResponse from @slack/web-api
  (params: FunctionFailArguments): Promise<WorkflowsStepFailedResponse>;
}

export interface WorkflowFunctionExecuteMiddlewareArgs extends SlackEventMiddlewareArgs<'function_executed'> {
  function: FunctionExecutedEvent;
  complete: FunctionCompleteFn;
  fail: FunctionFailFn;
}

/** Types */

export type SlackWorkflowFunctionMiddlewareArgs = WorkflowFunctionExecuteMiddlewareArgs;

export type WorkflowFunctionExecuteMiddleware = Middleware<WorkflowFunctionExecuteMiddlewareArgs>;

export type WorkflowFunctionMiddleware = WorkflowFunctionExecuteMiddleware[];

export type AllWorkflowFunctionMiddlewareArgs
  <T extends SlackWorkflowFunctionMiddlewareArgs = SlackWorkflowFunctionMiddlewareArgs> = T & AllMiddlewareArgs;

/** Constants */

const VALID_PAYLOAD_TYPES = new Set(['function_executed']);

/** Class */

export class WorkflowFunction {
  /** Function callback_id */
  public callbackId: string;

  /** Function definition */
  private middleware: WorkflowFunctionMiddleware;

  public constructor(
    callbackId: string,
    middleware: WorkflowFunctionMiddleware,
  ) {
    validate(callbackId, middleware);

    this.callbackId = callbackId;
    this.middleware = middleware;
  }

  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<any> => {
      if (isFunctionEvent(args) && this.matchesConstraints(args)) {
        return this.processEvent(args);
      }
      return args.next();
    };
  }

  private matchesConstraints(args: SlackWorkflowFunctionMiddlewareArgs): boolean {
    return args.payload.function.callback_id === this.callbackId;
  }

  private async processEvent(args: AllWorkflowFunctionMiddlewareArgs): Promise<void> {
    const functionArgs = prepareFunctionArgs(args);
    const stepMiddleware = this.getStepMiddleware();
    return processStepMiddleware(functionArgs, stepMiddleware);
  }

  private getStepMiddleware(): WorkflowFunctionMiddleware {
    return this.middleware;
  }
}

/** Helper Functions */

export function validate(callbackId: string, listeners: WorkflowFunctionMiddleware): void {
  // Ensure callbackId is valid
  if (typeof callbackId !== 'string') {
    const errorMsg = 'WorkflowFunction expects a callback_id as the first argument';
    throw new WorkflowFunctionInitializationError(errorMsg);
  }

  // TODO: Validate that all array members are functions
  console.log(listeners);
}

/**
 * `processStepMiddleware()` invokes each callback for lifecycle event
 * @param args workflow_step_edit action
 */
export async function processStepMiddleware(
  args: AllWorkflowFunctionMiddlewareArgs,
  middleware: WorkflowFunctionMiddleware,
): Promise<void> {
  const { context, client, logger } = args;
  const callbacks = [...middleware] as Middleware<AnyMiddlewareArgs>[];
  const lastCallback = callbacks.pop();

  if (lastCallback !== undefined) {
    await processMiddleware(
      callbacks, args, context, client, logger,
      async () => lastCallback({ ...args, context, client, logger }),
    );
  }
}

export function isFunctionEvent(args: AnyMiddlewareArgs): args is AllWorkflowFunctionMiddlewareArgs {
  return VALID_PAYLOAD_TYPES.has(args.payload.type);
}

// TODO :: might be important for upcoming CLI compatability. Remove if not.
// function selectToken(context: Context): string | undefined {
//   return context.botToken !== undefined ? context.botToken : context.userToken;
// }

/**
 * Factory for `complete()` utility
 * @param args function_executed event
 */
function createFunctionComplete(
  args: AllWorkflowFunctionMiddlewareArgs<WorkflowFunctionExecuteMiddlewareArgs>,
): FunctionCompleteFn {
  const {
    // context,  // TODO : remove if not helpful for CLI
    client,
    payload: { function_execution_id },
  } = args;
  // const token = selectToken(context); // TODO : remove if not helpful for CLI

  return (params: Parameters<FunctionCompleteFn>[0] = {}) => client.functions.completeSuccess({
    outputs: params.outputs,
    function_execution_id,
  });

  // return (params: Parameters<FunctionCompleteFn>[0] = {}) => client.apiCall('functions.completeSuccess', {
  //   outputs: params.outputs,
  //   function_execution_id,
  // });
}

/**
 * Factory for `fail()` utility
 * @param args function_executed event
 */
function createFunctionFail(
  args: AllWorkflowFunctionMiddlewareArgs<WorkflowFunctionExecuteMiddlewareArgs>,
): FunctionFailFn {
  const {
    // context,  // TODO : remove if not helpful for CLI
    client,
    payload: { function_execution_id },
  } = args;
  // const token = selectToken(context);  // TODO : remove if not helpful for CLI

  return (params: Parameters<FunctionFailFn>[0]) => {
    const { error } = params ?? {};

    return client.functions.completeError({
      error,
      function_execution_id,
    });

    // return client.apiCall('functions.completeError', {
    //   function_execution_id,
    //   error,
    // });
  };
}

/**
 * `prepareFunctionArgs()` takes in a function's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * */
export function prepareFunctionArgs(args: any): AllWorkflowFunctionMiddlewareArgs {
  const { next: _next, ...functionArgs } = args;
  const preparedArgs: any = { ...functionArgs };

  // Utility args
  preparedArgs.function = preparedArgs.event.function; // ie, function definition
  preparedArgs.inputs = preparedArgs.event.inputs;
  preparedArgs.complete = createFunctionComplete(preparedArgs);
  preparedArgs.fail = createFunctionFail(preparedArgs);

  return preparedArgs;
}
