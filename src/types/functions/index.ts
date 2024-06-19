import {
  FunctionsCompleteErrorResponse,
  FunctionsCompleteSuccessResponse,
} from '@slack/web-api';
import {
  AllMiddlewareArgs,
  FunctionExecutedEvent,
  Middleware,
  SlackEventMiddlewareArgs,
} from '../index';

/**
 * Manifest values used to describe metadata of the function.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface FunctionParams {
  type: string;
  name: string;
  description?: string;
  title?: string;
  is_required: boolean;
}

/**
 * Mappings of defined inputs to actual input values.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface FunctionInputs {
  [key: string]: unknown;
}

/**
 * Mappings of provided outputs and resulting values.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface FunctionOutputValues {
  [key: string]: unknown;
}

/**
 * Output parameters from a successful function execution.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface FunctionCompleteArguments {
  outputs?: {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

/**
 * The function called with output parameters to complete the function execution with success.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface FunctionCompleteFn {
  (params?: FunctionCompleteArguments): Promise<FunctionsCompleteSuccessResponse>;
}

/**
 * Information about the failed function execution.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface FunctionFailArguments {
  error: string;
}

/**
 * The function called with error information to end the function executions with an error.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface FunctionFailFn {
  (params: FunctionFailArguments): Promise<FunctionsCompleteErrorResponse>;
}

/**
 * Incoming event details specific to the function execution. These are optional
 * and not added to context if not found in the event.
 */
export interface CustomFunctionContext {
  /**
   * The unique id of the function execution event.
   * @link https://api.slack.com/automation/functions/custom
   */
  functionExecutionId?: string;
  /**
   * A JIT bot access token specific to the execution.
   * @link https://api.slack.com/authentication/token-types#wfb
   */
  functionBotAccessToken?: string;
  /**
   * Input values for the function from the execution.
   * @link https://api.slack.com/automation/functions/custom
   */
  functionInputs?: FunctionInputs;
}

/**
 * Additional arguments provided to listener handlers and middleware for a function.
 * The complete set of arguments is found by extending the function executed event.
 * @link https://api.slack.com/automation/functions/custom
 */
export interface CustomFunctionMiddlewareArgs {
  /**
   * Parameters provided to the function from the function execution event.
   * @property an object of manifest defined keys with values from the execution event.
   * @example
   * const { user_id, message } = inputs;
   * @link https://api.slack.com/automation/functions/custom
   */
  inputs: FunctionExecutedEvent['inputs'];

  /**
   * Complete the function with success and outputs.
   * @property parameters returned from the function.
   * @example
   * const response = await complete({
   *   outputs: {
   *     is_even: true,
   *     number: 12,
   *   }
   * });
   * @link https://api.slack.com/automation/functions/custom
   */
  complete: FunctionCompleteFn;

  /**
   * End the function with an error.
   * @property details sent to the user about the cause of error.
   * @example
   * const response = await fail({
   *   error: 'Something strange happened!',
   * });
   * @link https://api.slack.com/automation/functions/custom
   */
  fail: FunctionFailFn;
}

/**
 * Listener used as middleware for a function handler.
 * @link https://api.slack.com/automation/functions/custom
 */
export type SlackCustomFunctionMiddlewareArgs = SlackEventMiddlewareArgs<'function_executed'> & CustomFunctionMiddlewareArgs;

/**
 * Multiple listeners that make the function handler middleware.
 * @link https://api.slack.com/automation/functions/custom
 */
export type CustomFunctionMiddleware = Middleware<SlackCustomFunctionMiddlewareArgs>[];

/**
 * Arugments provided to the listner handlers for a function execution event.
 * @link https://api.slack.com/automation/functions/custom
 */
export type AllCustomFunctionMiddlewareArgs
  <T extends SlackCustomFunctionMiddlewareArgs = SlackCustomFunctionMiddlewareArgs> = T & AllMiddlewareArgs;
