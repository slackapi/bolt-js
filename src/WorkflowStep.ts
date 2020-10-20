import { WebAPICallResult, KnownBlock, Block } from '@slack/web-api';
import {
  Middleware,
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  SlackActionMiddlewareArgs,
  SlackViewMiddlewareArgs,
  WorkflowStepEdit,
  Context,
  SlackEventMiddlewareArgs,
  ViewWorkflowStepSubmitAction,
  WorkflowStepExecuteEvent,
} from './types';
import processMiddleware from './middleware/process';
import { WorkflowStepInitializationError } from './errors';

/** Interfaces */

export interface StepConfigureArguments {
  blocks: (KnownBlock | Block)[];
  private_metadata?: string;
  submit_disabled?: boolean;
  external_id?: string;
}

export interface StepUpdateArguments {
  inputs?: {
    [key: string]: {
      value: any;
      skip_variable_replacement?: boolean;
      variables?: {
        [key: string]: any;
      };
    };
  };
  outputs?: [
    {
      name: string;
      type: string;
      label: string;
    },
  ];
  step_name?: string;
  step_image_url?: string;
}

export interface StepCompleteArguments {
  outputs?: {
    [key: string]: any;
  };
}

export interface StepFailArguments {
  error: {
    message: string;
  };
}

export interface StepConfigureFn {
  (params: StepConfigureArguments): Promise<WebAPICallResult>;
}

export interface StepUpdateFn {
  (params?: StepUpdateArguments): Promise<WebAPICallResult>;
}

export interface StepCompleteFn {
  (params?: StepCompleteArguments): Promise<WebAPICallResult>;
}

export interface StepFailFn {
  (params: StepFailArguments): Promise<WebAPICallResult>;
}

export interface WorkflowStepConfig {
  edit: WorkflowStepEditMiddleware | WorkflowStepEditMiddleware[];
  save: WorkflowStepSaveMiddleware | WorkflowStepSaveMiddleware[];
  execute: WorkflowStepExecuteMiddleware | WorkflowStepExecuteMiddleware[];
}

export interface WorkflowStepEditMiddlewareArgs extends SlackActionMiddlewareArgs<WorkflowStepEdit> {
  step: WorkflowStepEdit['workflow_step'];
  configure: StepConfigureFn;
}

export interface WorkflowStepSaveMiddlewareArgs extends SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction> {
  step: ViewWorkflowStepSubmitAction['workflow_step'];
  update: StepUpdateFn;
}

export interface WorkflowStepExecuteMiddlewareArgs extends SlackEventMiddlewareArgs<'workflow_step_execute'> {
  step: WorkflowStepExecuteEvent['workflow_step'];
  complete: StepCompleteFn;
  fail: StepFailFn;
}

/** Types */

export type SlackWorkflowStepMiddlewareArgs =
  | WorkflowStepEditMiddlewareArgs
  | WorkflowStepSaveMiddlewareArgs
  | WorkflowStepExecuteMiddlewareArgs;

export type WorkflowStepEditMiddleware = Middleware<WorkflowStepEditMiddlewareArgs>;
export type WorkflowStepSaveMiddleware = Middleware<WorkflowStepSaveMiddlewareArgs>;
export type WorkflowStepExecuteMiddleware = Middleware<WorkflowStepExecuteMiddlewareArgs>;

export type WorkflowStepMiddleware =
  | WorkflowStepEditMiddleware[]
  | WorkflowStepSaveMiddleware[]
  | WorkflowStepExecuteMiddleware[];

export type AllWorkflowStepMiddlewareArgs<
  T extends SlackWorkflowStepMiddlewareArgs = SlackWorkflowStepMiddlewareArgs
> = T & AllMiddlewareArgs;

/** Constants */

const VALID_PAYLOAD_TYPES = new Set(['workflow_step_edit', 'workflow_step', 'workflow_step_execute']);

/** Class */

export class WorkflowStep {
  /** Step callback_id */
  private callbackId: string;

  /** Step Add/Edit :: 'workflow_step_edit' action */
  private edit: WorkflowStepEditMiddleware[];

  /** Step Config Save :: 'view_submission' */
  private save: WorkflowStepSaveMiddleware[];

  /** Step Executed/Run :: 'workflow_step_execute' event */
  private execute: WorkflowStepExecuteMiddleware[];

  constructor(callbackId: string, config: WorkflowStepConfig) {
    validate(callbackId, config);

    const { save, edit, execute } = config;

    this.callbackId = callbackId;
    this.save = Array.isArray(save) ? save : [save];
    this.edit = Array.isArray(edit) ? edit : [edit];
    this.execute = Array.isArray(execute) ? execute : [execute];
  }

  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<any> => {
      if (isStepEvent(args) && this.matchesConstraints(args)) {
        return this.processEvent(args);
      }
      return args.next!();
    };
  }

  private matchesConstraints(args: SlackWorkflowStepMiddlewareArgs): boolean {
    return args.payload.callback_id === this.callbackId;
  }

  private async processEvent(args: AllWorkflowStepMiddlewareArgs): Promise<void> {
    const { payload } = args;
    const stepArgs = prepareStepArgs(args);
    const stepMiddleware = this.getStepMiddleware(payload);
    return processStepMiddleware(stepArgs, stepMiddleware);
  }

  private getStepMiddleware(payload: AllWorkflowStepMiddlewareArgs['payload']): WorkflowStepMiddleware {
    switch (payload.type) {
      case 'workflow_step_edit':
        return this.edit;
      case 'workflow_step':
        return this.save;
      case 'workflow_step_execute':
        return this.execute;
      default:
        return [];
    }
  }
}

/** Helper Functions */

export function validate(callbackId: string, config: WorkflowStepConfig): void {
  // Ensure callbackId is valid
  if (typeof callbackId !== 'string') {
    const errorMsg = 'WorkflowStep expects a callback_id as the first argument';
    throw new WorkflowStepInitializationError(errorMsg);
  }

  // Ensure step config object is passed in
  if (typeof config !== 'object') {
    const errorMsg = 'WorkflowStep expects a configuration object as the second argument';
    throw new WorkflowStepInitializationError(errorMsg);
  }

  // Check for missing required keys
  const requiredKeys: (keyof WorkflowStepConfig)[] = ['save', 'edit', 'execute'];
  const missingKeys: (keyof WorkflowStepConfig)[] = [];
  requiredKeys.forEach((key) => {
    if (config[key] === undefined) {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length > 0) {
    const errorMsg = `WorkflowStep is missing required keys: ${missingKeys.join(', ')}`;
    throw new WorkflowStepInitializationError(errorMsg);
  }

  // Ensure a callback or an array of callbacks is present
  const requiredFns: (keyof WorkflowStepConfig)[] = ['save', 'edit', 'execute'];
  requiredFns.forEach((fn) => {
    if (typeof config[fn] !== 'function' && !Array.isArray(config[fn])) {
      const errorMsg = `WorkflowStep ${fn} property must be a function or an array of functions`;
      throw new WorkflowStepInitializationError(errorMsg);
    }
  });
}

/**
 * `processStepMiddleware()` invokes each callback for lifecycle event
 * @param args workflow_step_edit action
 */
export async function processStepMiddleware(
  args: AllWorkflowStepMiddlewareArgs,
  middleware: WorkflowStepMiddleware,
): Promise<void> {
  const { context, client, logger } = args;
  // TODO :: revisit type used below (look into contravariance)
  const callbacks = [...middleware] as Middleware<AnyMiddlewareArgs>[];
  const lastCallback = callbacks.pop();

  if (lastCallback !== undefined) {
    await processMiddleware(callbacks, args, context, client, logger, async () =>
      lastCallback({ ...args, context, client, logger }),
    );
  }
}

export function isStepEvent(args: AnyMiddlewareArgs): args is AllWorkflowStepMiddlewareArgs {
  return VALID_PAYLOAD_TYPES.has(args.payload.type);
}

function selectToken(context: Context): string | undefined {
  return context.botToken !== undefined ? context.botToken : context.userToken;
}

/**
 * Factory for `configure()` utility
 * @param args workflow_step_edit action
 */
function createStepConfigure(args: AllWorkflowStepMiddlewareArgs<WorkflowStepEditMiddlewareArgs>): StepConfigureFn {
  const {
    context,
    client,
    body: { callback_id, trigger_id },
  } = args;
  const token = selectToken(context);

  return (params: Parameters<StepConfigureFn>[0]) => {
    return client.views.open({
      token,
      trigger_id,
      view: {
        callback_id,
        type: 'workflow_step',
        ...params,
      },
    });
  };
}

/**
 * Factory for `update()` utility
 * @param args view_submission event
 */
function createStepUpdate(args: AllWorkflowStepMiddlewareArgs<WorkflowStepSaveMiddlewareArgs>): StepUpdateFn {
  const {
    context,
    client,
    body: {
      workflow_step: { workflow_step_edit_id },
    },
  } = args;
  const token = selectToken(context);

  return (params: Parameters<StepUpdateFn>[0] = {}) => {
    return client.workflows.updateStep({
      token,
      workflow_step_edit_id,
      ...params,
    });
  };
}

/**
 * Factory for `complete()` utility
 * @param args workflow_step_execute event
 */
function createStepComplete(args: AllWorkflowStepMiddlewareArgs<WorkflowStepExecuteMiddlewareArgs>): StepCompleteFn {
  const {
    context,
    client,
    payload: {
      workflow_step: { workflow_step_execute_id },
    },
  } = args;
  const token = selectToken(context);

  return (params: Parameters<StepCompleteFn>[0] = {}) => {
    return client.workflows.stepCompleted({
      token,
      workflow_step_execute_id,
      ...params,
    });
  };
}

/**
 * Factory for `fail()` utility
 * @param args workflow_step_execute event
 */
function createStepFail(args: AllWorkflowStepMiddlewareArgs<WorkflowStepExecuteMiddlewareArgs>): StepFailFn {
  const {
    context,
    client,
    payload: {
      workflow_step: { workflow_step_execute_id },
    },
  } = args;
  const token = selectToken(context);

  return (params: Parameters<StepFailFn>[0]) => {
    const { error } = params;
    return client.workflows.stepFailed({
      token,
      workflow_step_execute_id,
      error,
    });
  };
}

/**
 * `prepareStepArgs()` takes in a workflow step's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * */
// TODO :: refactor to incorporate a generic parameter
export function prepareStepArgs(args: any): AllWorkflowStepMiddlewareArgs {
  const { next, ...stepArgs } = args;
  const preparedArgs: any = { ...stepArgs };

  switch (preparedArgs.payload.type) {
    case 'workflow_step_edit':
      preparedArgs.step = preparedArgs.action.workflow_step;
      preparedArgs.configure = createStepConfigure(preparedArgs);
      break;
    case 'workflow_step':
      preparedArgs.step = preparedArgs.body.workflow_step;
      preparedArgs.update = createStepUpdate(preparedArgs);
      break;
    case 'workflow_step_execute':
      preparedArgs.step = preparedArgs.event.workflow_step;
      preparedArgs.complete = createStepComplete(preparedArgs);
      preparedArgs.fail = createStepFail(preparedArgs);
      break;
    default:
      break;
  }

  return preparedArgs;
}
