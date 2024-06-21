import {
  FunctionsCompleteErrorResponse,
  FunctionsCompleteSuccessResponse,
  WebClient,
} from '@slack/web-api';
import {
  CustomFunctionInitializationError,
  CustomFunctionRuntimeError,
} from './errors';
import {
  AllCustomFunctionMiddlewareArgs,
  AnyMiddlewareArgs,
  Context,
  CustomFunctionContext,
  CustomFunctionMiddleware,
  CustomFunctionMiddlewareArgs,
  FunctionCompleteArguments,
  FunctionFailArguments,
  Middleware,
} from './types';
import { selectToken } from './middleware/context';
import processMiddleware from './middleware/process';
import { StringIndexed } from './types/helpers';

/** Payload event types related to custom functions. */
const VALID_PAYLOAD_TYPES = new Set(['function_executed']);

export default class CustomFunction {
  /** Function callback_id */
  public callbackId: string;

  private middleware: CustomFunctionMiddleware;

  private client: WebClient;

  /**
   * Builds a custom function listener for the callback_id function.
   * @param callbackId - the function callback ID.
   * @param middleware - an array of function middleware.
   * @param client - custom configurations for a  web client.
   */
  public constructor(
    callbackId: string,
    middleware: CustomFunctionMiddleware,
    client: WebClient,
  ) {
    CustomFunction.validateCustomFunctionHandler(callbackId, middleware);
    this.callbackId = callbackId;
    this.middleware = middleware;
    this.client = client;
  }

  /**
   * Ensure arguments provided to the `function()` handler match expected types.
   * A valid callback ID and a middleware function or functions are required.
   * @param callbackId - the function callback ID.
   * @param middleware - an array of function middleware.
   * @throws whenever an input is invalid.
   */
  private static validateCustomFunctionHandler(callbackId: string, middleware: CustomFunctionMiddleware): void {
    if (typeof callbackId !== 'string') {
      const errorMsg = 'CustomFunction expects a callback_id as the first argument';
      throw new CustomFunctionInitializationError(errorMsg);
    }
    if (typeof middleware !== 'function' && !Array.isArray(middleware)) {
      const errorMsg = 'CustomFunction expects a function or array of functions as the second argument';
      throw new CustomFunctionInitializationError(errorMsg);
    }
    if (Array.isArray(middleware)) {
      middleware.forEach((fn, idx) => {
        if (typeof fn !== 'function') {
          const errorMsg = `CustomFunction middleware argument ${idx} is not a function but should be a function`;
          throw new CustomFunctionInitializationError(errorMsg);
        }
      });
    }
  }

  /**
   * Gather information related to the function and augment event context values
   * for function executions.
   * @param body - the received event.
   * @param withToken - if the function bot access token should be included.
   * @returns included context values.
   */
  public static extractContext(body: StringIndexed, withToken: boolean): CustomFunctionContext {
    const context: CustomFunctionContext = {};

    // function_executed event
    if (body.event && body.event.type === 'function_executed') {
      if (body.event.function_execution_id) {
        context.functionExecutionId = body.event.function_execution_id;
      }
      if (body.event.inputs) {
        context.functionInputs = body.event.inputs;
      }
      if (withToken && body.event.bot_access_token) {
        context.functionBotAccessToken = body.event.bot_access_token;
      }
    }

    // interactivity (block_actions)
    if (body.function_data) {
      if (body.function_data.execution_id) {
        context.functionExecutionId = body.function_data.execution_id;
      }
      if (body.function_data.inputs) {
        context.functionInputs = body.function_data.inputs;
      }
      if (withToken && body.bot_access_token) {
        context.functionBotAccessToken = body.bot_access_token;
      }
    }

    return context;
  }

  /**
   * Process the event using function arguments as middleware when matching
   * function constraints are found.
   * @returns function that is evaluated or skipped with given arguments.
   */
  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<void> => {
      if (!CustomFunction.isFunctionEvent(args) || this.callbackId !== args.payload.function.callback_id) {
        return args.next();
      }
      const middlewareArgs = CustomFunction.middlewareArgs(args.context, this.client);
      Object.assign(args, middlewareArgs);
      return CustomFunction.processFunctionMiddleware(args, this.middleware);
    };
  }

  /**
   * Determine if the arguments represent a function_executed event.
   * @param args - the inputs received as middleware of an event.
   * @returns if args is a function_executed event via payload.
   */
  private static isFunctionEvent(args: AnyMiddlewareArgs): args is AllCustomFunctionMiddlewareArgs {
    return VALID_PAYLOAD_TYPES.has(args.payload.type);
  }

  /**
   * Gather function callbacks as middleware to invoke each one as part of the
   * event lifecycle.
   * @param args - contains arguments include as middleware inputs.
   * @param middleware - holds a list of middleware to execute.
   */
  private static async processFunctionMiddleware(
    args: AllCustomFunctionMiddlewareArgs,
    middleware: CustomFunctionMiddleware,
  ): Promise<void> {
    const { context, client, logger } = args;
    const callbacks = [...middleware] as Middleware<AnyMiddlewareArgs>[];
    const lastCallback = callbacks.pop();

    if (lastCallback !== undefined) {
      await processMiddleware(
        callbacks,
        args,
        context,
        client,
        logger,
        async () => lastCallback({ ...args, context, client, logger }),
      );
    }
  }

  /**
   * Configure middleware arguments to provide to function listeners.
   * @param context - the function execution context.
   * @param client - a configured web client.
   * @returns listener arguments configured for the function execution.
   * @throws when function_execution_id is not included in arguments.
   */
  public static middlewareArgs(context: Context, client: WebClient): CustomFunctionMiddlewareArgs {
    const { functionExecutionId, functionInputs } = context;
    if (functionExecutionId === undefined) {
      throw new CustomFunctionRuntimeError('No function_execution_id was found in the context');
    }
    const token = selectToken(context);
    return {
      inputs: functionInputs ?? {},
      complete: (params: FunctionCompleteArguments = {}): Promise<FunctionsCompleteSuccessResponse> => (
        client.functions.completeSuccess({
          token,
          outputs: params.outputs ?? {},
          function_execution_id: functionExecutionId,
        })
      ),
      fail: (params: FunctionFailArguments): Promise<FunctionsCompleteErrorResponse> => (
        client.functions.completeError({
          token,
          error: params.error,
          function_execution_id: functionExecutionId,
        })
      ),
    };
  }
}
