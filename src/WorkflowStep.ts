import type { WorkflowStepExecuteEvent } from '@slack/types';
import type {
  Block,
  KnownBlock,
  ViewsOpenResponse,
  WorkflowsStepCompletedResponse,
  WorkflowsStepFailedResponse,
  WorkflowsUpdateStepResponse,
} from '@slack/web-api';
import { WorkflowStepInitializationError } from './errors';
import processMiddleware from './middleware/process';
import type {
  AllMiddlewareArgs,
  AnyMiddlewareArgs,
  Context,
  Middleware,
  SlackActionMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackViewMiddlewareArgs,
  ViewWorkflowStepSubmitAction,
  WorkflowStepEdit,
} from './types';

/** Interfaces */

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepConfigureArguments {
  blocks: (KnownBlock | Block)[];
  private_metadata?: string;
  submit_disabled?: boolean;
  external_id?: string;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepUpdateArguments {
  inputs?: Record<
    string,
    {
      // biome-ignore lint/suspicious/noExplicitAny: user-defined workflow inputs could be anything
      value: any;
      skip_variable_replacement?: boolean;
      // biome-ignore lint/suspicious/noExplicitAny: user-defined workflow inputs could be anything
      variables?: Record<string, any>;
    }
  >;
  outputs?: {
    name: string;
    type: string;
    label: string;
  }[];
  step_name?: string;
  step_image_url?: string;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepCompleteArguments {
  // biome-ignore lint/suspicious/noExplicitAny: user-defined workflow outputs could be anything
  outputs?: Record<string, any>;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepFailArguments {
  error: {
    message: string;
  };
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepConfigureFn {
  (params: StepConfigureArguments): Promise<ViewsOpenResponse>;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepUpdateFn {
  (params?: StepUpdateArguments): Promise<WorkflowsUpdateStepResponse>;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepCompleteFn {
  (params?: StepCompleteArguments): Promise<WorkflowsStepCompletedResponse>;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface StepFailFn {
  (params: StepFailArguments): Promise<WorkflowsStepFailedResponse>;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface WorkflowStepConfig {
  edit: WorkflowStepEditMiddleware | WorkflowStepEditMiddleware[];
  save: WorkflowStepSaveMiddleware | WorkflowStepSaveMiddleware[];
  execute: WorkflowStepExecuteMiddleware | WorkflowStepExecuteMiddleware[];
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface WorkflowStepEditMiddlewareArgs extends SlackActionMiddlewareArgs<WorkflowStepEdit> {
  step: WorkflowStepEdit['workflow_step'];
  configure: StepConfigureFn;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface WorkflowStepSaveMiddlewareArgs extends SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction> {
  step: ViewWorkflowStepSubmitAction['workflow_step'];
  update: StepUpdateFn;
}

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface WorkflowStepExecuteMiddlewareArgs extends SlackEventMiddlewareArgs<'workflow_step_execute'> {
  step: WorkflowStepExecuteEvent['workflow_step'];
  complete: StepCompleteFn;
  fail: StepFailFn;
}

/** Types */

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export type SlackWorkflowStepMiddlewareArgs =
  | WorkflowStepEditMiddlewareArgs
  | WorkflowStepSaveMiddlewareArgs
  | WorkflowStepExecuteMiddlewareArgs;

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export type WorkflowStepEditMiddleware = Middleware<WorkflowStepEditMiddlewareArgs>;
/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export type WorkflowStepSaveMiddleware = Middleware<WorkflowStepSaveMiddlewareArgs>;
/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export type WorkflowStepExecuteMiddleware = Middleware<WorkflowStepExecuteMiddlewareArgs>;

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export type WorkflowStepMiddleware =
  | WorkflowStepEditMiddleware[]
  | WorkflowStepSaveMiddleware[]
  | WorkflowStepExecuteMiddleware[];

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export type AllWorkflowStepMiddlewareArgs<T extends SlackWorkflowStepMiddlewareArgs = SlackWorkflowStepMiddlewareArgs> =
  T & AllMiddlewareArgs;

/** Constants */

const VALID_PAYLOAD_TYPES = new Set(['workflow_step_edit', 'workflow_step', 'workflow_step_execute']);

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export class WorkflowStep {
  /** Step callback_id */
  private callbackId: string;

  /** Step Add/Edit :: 'workflow_step_edit' action */
  private edit: WorkflowStepEditMiddleware[];

  /** Step Config Save :: 'view_submission' */
  private save: WorkflowStepSaveMiddleware[];

  /** Step Executed/Run :: 'workflow_step_execute' event */
  private execute: WorkflowStepExecuteMiddleware[];

  public constructor(callbackId: string, config: WorkflowStepConfig) {
    validate(callbackId, config);

    const { save, edit, execute } = config;

    this.callbackId = callbackId;
    this.save = Array.isArray(save) ? save : [save];
    this.edit = Array.isArray(edit) ? edit : [edit];
    this.execute = Array.isArray(execute) ? execute : [execute];
  }

  public getMiddleware(): Middleware<AnyMiddlewareArgs> {
    return async (args): Promise<void> => {
      if (isStepEvent(args) && this.matchesConstraints(args)) {
        return this.processEvent(args);
      }
      return args.next();
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

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
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
  for (const key of requiredKeys) {
    if (config[key] === undefined) {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    const errorMsg = `WorkflowStep is missing required keys: ${missingKeys.join(', ')}`;
    throw new WorkflowStepInitializationError(errorMsg);
  }

  // Ensure a callback or an array of callbacks is present
  const requiredFns: (keyof WorkflowStepConfig)[] = ['save', 'edit', 'execute'];
  for (const fn of requiredFns) {
    if (typeof config[fn] !== 'function' && !Array.isArray(config[fn])) {
      const errorMsg = `WorkflowStep ${fn} property must be a function or an array of functions`;
      throw new WorkflowStepInitializationError(errorMsg);
    }
  }
}

/**
 * `processStepMiddleware()` invokes each callback for lifecycle event
 * @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
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

/** @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
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

  return (params: Parameters<StepConfigureFn>[0]) =>
    client.views.open({
      token,
      trigger_id,
      view: {
        callback_id,
        type: 'workflow_step',
        ...params,
      },
    });
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

  return (params: Parameters<StepUpdateFn>[0] = {}) =>
    client.workflows.updateStep({
      token,
      workflow_step_edit_id,
      ...params,
    });
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

  return (params: Parameters<StepCompleteFn>[0] = {}) =>
    client.workflows.stepCompleted({
      token,
      workflow_step_execute_id,
      ...params,
    });
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
 * `prepareStepArgs()` takes in a step's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
// TODO :: refactor to incorporate a generic parameter
export function prepareStepArgs(args: AllWorkflowStepMiddlewareArgs): AllWorkflowStepMiddlewareArgs {
  const { next: _next, ...stepArgs } = args;
  // biome-ignore lint/suspicious/noExplicitAny: need to use any as the cases of the switch that follows dont narrow to the specific required args type. use type predicates for each workflow_step event args in the switch to get rid of this any.
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
