import type { WebClient } from '@slack/web-api';
import type { FunctionFailFn } from '../CustomFunction';
import { CustomFunctionCompleteFailError } from '../errors';
import type { Context } from '../types';

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
