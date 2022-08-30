/**
 * Execution Context
 */
export interface FunctionExecutionContext {
  execution_id: string,
  inputs: Record<string, unknown>,
  function: {
    callback_id: string,
  }
}

/**
 * FunctionInteractivityContext
 */
export interface FunctionInteractivityContext {
  interactor: {
    secret: string,
    id: string,
  }
  interactivity_pointer: string,
}

// exists for any events occurring in a function execution context
// extend this interface to add function context
export interface FunctionContext {
  bot_access_token?: string;
  function_data?: FunctionExecutionContext;
  interactivity?: FunctionInteractivityContext;
}
