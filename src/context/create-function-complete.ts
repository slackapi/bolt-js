import type { FunctionsCompleteSuccessResponse, WebClient } from '@slack/web-api';
import { CustomFunctionCompleteSuccessError } from '../errors';
import type { Context } from '../types';

interface FunctionCompleteArguments {
  // biome-ignore lint/suspicious/noExplicitAny: TODO: could probably improve custom function parameter shapes - deno-slack-sdk has a bunch of this stuff we should move to slack/types
  outputs?: Record<string, any>;
}

export type FunctionCompleteFn = {
  (params?: FunctionCompleteArguments): Promise<FunctionsCompleteSuccessResponse>;
  /**
   * @description Check if this complete function has been called.
   */
  hasBeenCalled(): boolean;
};

export function createFunctionComplete(context: Context, client: WebClient): FunctionCompleteFn {
  const { functionExecutionId } = context;

  if (!functionExecutionId) {
    const errorMsg = 'No function_execution_id found';
    throw new CustomFunctionCompleteSuccessError(errorMsg);
  }

  let called = false;
  const complete: FunctionCompleteFn = (params = {}) => {
    called = true;
    return client.functions.completeSuccess({
      outputs: params.outputs || {},
      function_execution_id: functionExecutionId,
    });
  };
  complete.hasBeenCalled = () => called;

  return complete;
}
