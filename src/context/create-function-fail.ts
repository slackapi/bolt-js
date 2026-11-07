import type { FunctionsCompleteErrorResponse, WebClient } from '@slack/web-api';
import { CustomFunctionCompleteFailError } from '../errors';
import type { Context } from '../types';

interface FunctionFailArguments {
  error: string;
}

export type FunctionFailFn = {
  (params: FunctionFailArguments): Promise<FunctionsCompleteErrorResponse>;
  /**
   * @description Check if this fail function has been called.
   */
  hasBeenCalled(): boolean;
};

export function createFunctionFail(context: Context, client: WebClient): FunctionFailFn {
  const { functionExecutionId } = context;

  if (!functionExecutionId) {
    const errorMsg = 'No function_execution_id found';
    throw new CustomFunctionCompleteFailError(errorMsg);
  }

  let called = false;
  const fail: FunctionFailFn = (params) => {
    called = true;
    return client.functions.completeError({
      error: params.error,
      function_execution_id: functionExecutionId,
    });
  };
  fail.hasBeenCalled = () => called;

  return fail;
}
