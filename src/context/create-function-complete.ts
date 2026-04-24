import type { WebClient } from '@slack/web-api';
import type { FunctionCompleteFn } from '../CustomFunction';
import { CustomFunctionCompleteSuccessError } from '../errors';
import type { Context } from '../types';

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
