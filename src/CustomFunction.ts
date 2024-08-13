/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  WebClient,
  FunctionsCompleteErrorResponse,
  FunctionsCompleteSuccessResponse,
  WebClientOptions,
} from '@slack/web-api';
import {
  Middleware,
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  SlackEventMiddlewareArgs,
  Context,
  FunctionExecutedEvent,
  SlackActionMiddlewareArgs,
  FunctionInputs,
  BlockButtonAction,
} from './types';
import processMiddleware from './middleware/process';
import { CustomFunctionCompleteFailError, CustomFunctionCompleteSuccessError, CustomFunctionInitializationError } from './errors';

/** Interfaces */

interface FunctionBlockAction extends BlockButtonAction {
  // related to a function_executed event
  function_data: {
    execution_id: string;
    function: FunctionInputs;
    inputs: FunctionInputs;
  };
  interactivity: {
    interactor: unknown; // TODO :: replace
    interactivity_pointer: string;
  };
}

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
  inputs: FunctionExecutedEvent['inputs'];
  complete: FunctionCompleteFn;
  fail: FunctionFailFn;
}

export interface CustomFunctionActionMiddlewareArgs extends SlackActionMiddlewareArgs<FunctionBlockAction> {
  inputs: FunctionBlockAction['function_data']['inputs'];
  complete: FunctionCompleteFn;
  fail: FunctionFailFn;
}

/** Types */

export type SlackCustomFunctionMiddlewareArgs =
  CustomFunctionExecuteMiddlewareArgs | CustomFunctionActionMiddlewareArgs;

type CustomFunctionExecuteMiddleware = Middleware<CustomFunctionExecuteMiddlewareArgs>[];
type CustomFunctionActionMiddleware = Middleware<CustomFunctionActionMiddlewareArgs>[];

export type CustomFunctionMiddleware = CustomFunctionExecuteMiddleware | CustomFunctionActionMiddleware;

export type AllCustomFunctionMiddlewareArgs
  <T extends SlackCustomFunctionMiddlewareArgs = SlackCustomFunctionMiddlewareArgs> = T & AllMiddlewareArgs;

/** Constants */

const VALID_PAYLOAD_TYPES = new Set(['function_executed', 'block_actions']);

/** Class */

export class CustomFunction {
  /** Function callback_id */
  public callbackId: string;

  private appWebClientOptions: WebClientOptions;

  private middleware: CustomFunctionMiddleware;

  public constructor(
    callbackId: string,
    middleware: CustomFunctionMiddleware,
    clientOptions: WebClientOptions,
  ) {
    validate(callbackId, middleware);

    this.appWebClientOptions = clientOptions;
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
    // function_executed event
    if ('function' in args.payload) {
      return args.payload.function.callback_id === this.callbackId;
    }

    // 'block_actions` event
    if (args.body.type === 'block_actions' && args.body.function_data) {
      return args.body.function_data.function.callback_id === this.callbackId;
    }

    return false;
  }

  private async processEvent(args: AllCustomFunctionMiddlewareArgs): Promise<void> {
    const functionArgs = enrichFunctionArgs(args, this.appWebClientOptions);
    const functionMiddleware = this.getFunctionMiddleware();
    return processFunctionMiddleware(functionArgs, functionMiddleware);
  }

  private getFunctionMiddleware(): CustomFunctionMiddleware {
    return this.middleware;
  }

  /**
   * Factory for `complete()` utility
   */
  public static createFunctionComplete(context: Context, client: WebClient): FunctionCompleteFn {
    const token = selectToken(context);
    const { functionExecutionId } = context;

    if (!functionExecutionId) {
      const errorMsg = 'No function_execution_id found';
      throw new CustomFunctionCompleteSuccessError(errorMsg);
    }

    return (params: Parameters<FunctionCompleteFn>[0] = {}) => client.functions.completeSuccess({
      token,
      outputs: params.outputs || {},
      function_execution_id: functionExecutionId,
    });
  }

  /**
 * Factory for `fail()` utility
 */
  public static createFunctionFail(context: Context, client: WebClient): FunctionFailFn {
    const token = selectToken(context);
    const { functionExecutionId } = context;

    if (!functionExecutionId) {
      const errorMsg = 'No function_execution_id found';
      throw new CustomFunctionCompleteFailError(errorMsg);
    }

    return (params: Parameters<FunctionFailFn>[0]) => {
      const { error } = params ?? {};

      return client.functions.completeError({
        token,
        error,
        function_execution_id: functionExecutionId,
      });
    };
  }
}

/** Helper Functions */
export function validate(callbackId: string, middleware: CustomFunctionMiddleware): void {
  // Ensure callbackId is valid
  if (typeof callbackId !== 'string') {
    const errorMsg = 'CustomFunction expects a callback_id as the first argument';
    throw new CustomFunctionInitializationError(errorMsg);
  }

  // Ensure middleware argument is either a function or an array
  if (typeof middleware !== 'function' && !Array.isArray(middleware)) {
    const errorMsg = 'CustomFunction expects a function or array of functions as the second argument';
    throw new CustomFunctionInitializationError(errorMsg);
  }

  // Ensure array includes only functions
  if (Array.isArray(middleware)) {
    middleware.forEach((fn) => {
      if (!(fn instanceof Function)) {
        const errorMsg = 'All CustomFunction middleware must be functions';
        throw new CustomFunctionInitializationError(errorMsg);
      }
    });
  }
}

/**
 * `processFunctionMiddleware()` invokes each listener middleware
 */
export async function processFunctionMiddleware(
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

export function isFunctionEvent(args: AnyMiddlewareArgs): args is AllCustomFunctionMiddlewareArgs {
  return VALID_PAYLOAD_TYPES.has(args.payload.type) || VALID_PAYLOAD_TYPES.has(args.body.type);
}

function selectToken(context: Context): string | undefined {
  // If attachFunctionToken = false, fallback to botToken or userToken
  return context.functionBotAccessToken ? context.functionBotAccessToken : context.botToken || context.userToken;
}

/**
 * `enrichFunctionArgs()` takes in a function's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * */
export function enrichFunctionArgs(
  args: AllCustomFunctionMiddlewareArgs, webClientOptions: WebClientOptions,
): AllCustomFunctionMiddlewareArgs {
  // const { next: _next, ...functionArgs } = args;
  const enrichedArgs = { ...args };
  const token = selectToken(args.context);

  // Making calls with a functionBotAccessToken establishes continuity between
  // a function_executed event and subsequent interactive events (actions)
  const client = new WebClient(token, webClientOptions);
  enrichedArgs.client = client;

  // Utility args
  // @ts-ignore
  enrichedArgs.inputs = !enrichedArgs.inputs ? enrichedArgs.event.inputs : enrichedArgs.inputs;
  // enrichedArgs.inputs = enrichedArgs.event.inputs;
  // enrichedArgs.inputs = {}; // REMOVE!
  enrichedArgs.complete = CustomFunction.createFunctionComplete(enrichedArgs.context, client);
  enrichedArgs.fail = CustomFunction.createFunctionFail(enrichedArgs.context, client);

  return enrichedArgs as AllCustomFunctionMiddlewareArgs; // TODO: dangerous casting as it obfuscates missing `next()`
}
