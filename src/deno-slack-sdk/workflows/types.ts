import { SlackManifest } from "../manifest";
import type { ManifestWorkflowSchema } from "../types";
import {
  ParameterPropertiesDefinition,
  ParameterSetDefinition,
  ParameterVariableType,
  PossibleParameterKeys,
} from "../parameters/mod";

export interface ISlackWorkflow {
  id: string;
  export: () => ManifestWorkflowSchema;
  registerStepFunctions: (manifest: SlackManifest) => void;
  registerParameterTypes: (manfest: SlackManifest) => void;
}

export type SlackWorkflowDefinition<Definition> = Definition extends
  SlackWorkflowDefinitionArgs<infer I, infer O, infer RI, infer RO>
  ? SlackWorkflowDefinitionArgs<I, O, RI, RO>
  : never;

export type SlackWorkflowDefinitionArgs<
  InputParameters extends ParameterSetDefinition,
  OutputParameters extends ParameterSetDefinition,
  RequiredInputs extends PossibleParameterKeys<InputParameters>,
  RequiredOutputs extends PossibleParameterKeys<OutputParameters>,
> = {
  callback_id: string;
  title: string;
  description?: string;
  "input_parameters"?: ParameterPropertiesDefinition<
    InputParameters,
    RequiredInputs
  >;
  "output_parameters"?: ParameterPropertiesDefinition<
    OutputParameters,
    RequiredOutputs
  >;
};

export type WorkflowInputs<
  Params extends ParameterSetDefinition,
  RequiredParams extends PossibleParameterKeys<Params>,
> = WorkflowParameterReferences<Params, RequiredParams>;

export type WorkflowOutputs<
  Params extends ParameterSetDefinition,
  RequiredParams extends PossibleParameterKeys<Params>,
> = WorkflowParameterReferences<Params, RequiredParams>;

export type WorkflowStepOutputs<
  Params extends ParameterSetDefinition,
  RequiredParams extends PossibleParameterKeys<Params>,
> = WorkflowParameterReferences<Params, RequiredParams>;

type WorkflowParameterReferences<
  Parameters extends ParameterSetDefinition,
  Required extends PossibleParameterKeys<Parameters>,
> =
  & {
    [name in Required[number]]: ParameterVariableType<
      Parameters[name]
    >;
  }
  & {
    [name in keyof Parameters]?: ParameterVariableType<Parameters[name]>;
  };

// Workflow Step inputs are different than workflow inputs/outputs or workflow step outputs.
// They are purely the config values for the step, and not definitions that can be referenced
// as variables like you can with workflow inputs and workflow step outputs
export type WorkflowStepInputs<
  InputParameters extends ParameterSetDefinition,
  RequiredInputs extends PossibleParameterKeys<InputParameters>,
> =
  & {
    // deno-lint-ignore no-explicit-any
    [k in RequiredInputs[number]]: any;
  }
  & {
    // deno-lint-ignore no-explicit-any
    [k in keyof InputParameters]?: any;
  };
