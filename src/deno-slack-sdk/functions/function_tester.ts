import type { FunctionContext } from "./types";
type SlackFunctionTesterArgs<
  InputParameters,
> =
  & Partial<
    FunctionContext<InputParameters>
  >
  & {
    inputs: InputParameters;
  };

export const SlackFunctionTester = (callbackId: string) => {
  const now = new Date();
  const testFnID = `fn${now.getTime()}`;

  const createContext = <InputParameters>(
    args: SlackFunctionTesterArgs<InputParameters>,
  ): FunctionContext<InputParameters> => {
    const ts = new Date();

    return {
      inputs: (args.inputs || {}) as InputParameters,
      env: args.env || {},
      token: args.token || "slack-function-test-token",
      event: args.event || {
        type: "function_executed",
        event_ts: `${ts.getTime()}`,
        function_execution_id: `fx${ts.getTime()}`,
        inputs: args.inputs as Record<string, unknown>,
        function: {
          id: testFnID,
          callback_id: callbackId,
          title: "Function Test Title",
        },
      },
    };
  };

  return { createContext };
};
