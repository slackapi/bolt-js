/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  WebClient,
  FunctionsCompleteErrorResponse,
  FunctionsCompleteSuccessResponse,
} from '@slack/web-api';
import {
  Middleware,
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  SlackEventMiddlewareArgs,
  Context,
} from './types';
import processMiddleware from './middleware/process';
import { CustomFunctionInitializationError } from './errors';

/** Interfaces */

interface FunctionCompleteArguments {
  outputs?: {
    [key: string]: any;
  };
}

export interface FunctionCompleteFn {
  (params?: FunctionCompleteArguments): Promise<FunctionsCompleteSuccessResponse>;
}

interface FunctionFailArguments {
  error: string;
}

export interface FunctionFailFn {
  (params: FunctionFailArguments): Promise<FunctionsCompleteErrorResponse>;
}

export interface CustomFunctionExecuteMiddlewareArgs extends SlackEventMiddlewareArgs<'function_executed'> {
  complete: FunctionCompleteFn;
  fail: FunctionFailFn;
}

/** Types */

export type SlackCustomFunctionMiddlewareArgs = CustomFunctionExecuteMiddlewareArgs;

type CustomFunctionExecuteMiddleware = Middleware<CustomFunctionExecuteMiddlewareArgs>;

export type CustomFunctionMiddleware = CustomFunctionExecuteMiddleware[];

export type AllCustomFunctionMiddlewareArgs
  <T extends SlackCustomFunctionMiddlewareArgs = SlackCustomFunctionMiddlewareArgs> = T & AllMiddlewareArgs;

/** Constants */

const VALID_PAYLOAD_TYPES = new Set(['function_executed']);

/** Class */

export class CustomFunction {
  /** Function callback_id */
  public callbackId: string;

  private middleware: CustomFunctionMiddleware;

  public constructor(
    callbackId: string,
    middleware: CustomFunctionMiddleware,
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

  private matchesConstraints(args: SlackCustomFunctionMiddlewareArgs): boolean {
    return args.payload.function.callback_id === this.callbackId;
  }

  private async processEvent(args: AllCustomFunctionMiddlewareArgs): Promise<void> {
    const functionArgs = prepareFunctionArgs(args);
    const stepMiddleware = this.getStepMiddleware();
    return processStepMiddleware(functionArgs, stepMiddleware);
  }

  private getStepMiddleware(): CustomFunctionMiddleware {
    return this.middleware;
  }

  /**
   * Factory for `complete()` utility
   * @param args function_executed event
   */
  public static createFunctionComplete(context: Context, client: WebClient): FunctionCompleteFn {
    const token = selectToken(context);
    const { functionExecutionId } = context;

    return (params: Parameters<FunctionCompleteFn>[0] = {}) => client.functions.completeSuccess({
      token,
      outputs: params.outputs || {},
      function_execution_id: functionExecutionId,
    });
  }

  /**
 * Factory for `fail()` utility
 * @param args function_executed event
 */
  public static createFunctionFail(context: Context, client: WebClient): FunctionFailFn {
    const token = selectToken(context);

    return (params: Parameters<FunctionFailFn>[0]) => {
      const { error } = params ?? {};
      const { functionExecutionId } = context;

      return client.functions.completeError({
        token,
        error,
        function_execution_id: functionExecutionId,
      });
    };
  }
}

/** Helper Functions */

export function validate(callbackId: string, listeners: CustomFunctionMiddleware): void {
  // Ensure callbackId is valid
  if (typeof callbackId !== 'string') {
    const errorMsg = 'CustomFunction expects a callback_id as the first argument';
    throw new CustomFunctionInitializationError(errorMsg);
  }

  // Ensure all listeners are functions
  listeners.forEach((listener) => {
    if (!(listener instanceof Function)) {
      const errorMsg = 'All CustomFunction listeners must be functions';
      throw new CustomFunctionInitializationError(errorMsg);
    }
  });
}

/**
 * `processStepMiddleware()` invokes each callback for lifecycle event
 * @param args workflow_step_edit action
 */
export async function processStepMiddleware(
  args: AllCustomFunctionMiddlewareArgs,
  middleware: CustomFunctionMiddleware,
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

function isFunctionEvent(args: AnyMiddlewareArgs): args is AllCustomFunctionMiddlewareArgs {
  return VALID_PAYLOAD_TYPES.has(args.payload.type);
}

function selectToken(context: Context): string | undefined {
  // If attachFunctionToken = false, fallback to botToken or userToken
  return context.functionBotAccessToken ? context.functionBotAccessToken : context.botToken || context.userToken;
}

/**
 * `prepareFunctionArgs()` takes in a function's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * */
function prepareFunctionArgs(args: any): AllCustomFunctionMiddlewareArgs {
  const { next: _next, ...functionArgs } = args;
  const preparedArgs: any = { ...functionArgs };
  const token = selectToken(functionArgs.context);

  // Making calls with a functionBotAccessToken establishes continuity between
  // a function_executed event and subsequent interactive events (actions)
  const client = new WebClient(token, { ...functionArgs.client });
  preparedArgs.client = client;

  // Utility args
  preparedArgs.inputs = preparedArgs.event.inputs;
  preparedArgs.complete = CustomFunction.createFunctionComplete(preparedArgs.context, client);
  preparedArgs.fail = CustomFunction.createFunctionFail(preparedArgs.context, client);

  return preparedArgs;
}
