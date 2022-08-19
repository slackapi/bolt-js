/** 
 * Execution Context
 */
 export interface FunctionExecutionContext {
  execution_id: string,
  inputs: Record<string, unknown>,
  function: {
    id: string,
    callback_id: string,
    title: string,
    description: string,
    type: string,
    input_parameters: [],
    output_parameters: [],
    app_id: string,
    date_updated: number,
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
