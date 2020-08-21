import { WebAPICallResult } from '@slack/web-api';
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
import { processMiddleware } from './middleware/process';
import { WorkflowStepInitializationError } from './errors';

/** Interfaces */

export interface StepConfigureArguments {
  blocks: [];
  private_metadata?: string;
  submit_disabled?: boolean;
  external_id?: string;
}

export interface StepUpdateArguments {
  inputs?: {};
  outputs?: [];
  step_name?: string;
  step_image_url?: string;
}

export interface StepCompleteArguments {
  inputs?: {
    [key: string]: {
      value: string;
    };
  };
  outputs?: {
    type: string;
    name: string;
    label: string;
  }[];
}

export interface StepFailArguments {
  error: {
    message: string;
  };
}

export interface StepConfigureFn {
  (config: StepConfigureArguments): Promise<WebAPICallResult>;
}

export interface StepUpdateFn {
  (config: StepUpdateArguments): Promise<WebAPICallResult>;
}

export interface StepCompleteFn {
  (config: StepCompleteArguments): Promise<WebAPICallResult>;
}

export interface StepFailFn {
  (config: StepFailArguments): Promise<WebAPICallResult>;
}

interface WorkflowStepOptions {
  edit: WorkflowStep['edit'];
  save: WorkflowStep['save'];
  execute: WorkflowStep['execute'];
}

/** Types */

export type SlackWorkflowStepMiddlewareArgs =
  | SlackActionMiddlewareArgs<WorkflowStepEdit>
  | SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction>
  | SlackEventMiddlewareArgs<'workflow_step_execute'>;

type WorkflowStepMiddleware =
  | Middleware<SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction>>[]
  | Middleware<SlackActionMiddlewareArgs<WorkflowStepEdit>>[]
  | Middleware<SlackEventMiddlewareArgs<'workflow_step_execute'>>[];

type AllWorkflowStepMiddlewareArgs<T extends SlackWorkflowStepMiddlewareArgs = SlackWorkflowStepMiddlewareArgs> = T &
  AllMiddlewareArgs & {
    step: T extends SlackActionMiddlewareArgs<WorkflowStepEdit>
      ? WorkflowStepEdit['workflow_step']
      : T extends SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction>
      ? ViewWorkflowStepSubmitAction['workflow_step']
      : WorkflowStepExecuteEvent['workflow_step'];
    configure?: StepConfigureFn;
    update?: StepUpdateFn;
    complete?: StepCompleteFn;
    fail?: StepFailFn;
  };

/** Class */

export class WorkflowStep {
  /** Step callback_id */
  public callbackId: string;

  /** Step Add/Edit :: 'workflow_step_edit' action */
  public edit: Middleware<SlackActionMiddlewareArgs<WorkflowStepEdit>>[];

  /** Step Config Save :: 'view_submission' */
  public save: Middleware<SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction>>[];

  /** Step Executed/Run :: 'workflow_step_execute' event */
  public execute: Middleware<SlackEventMiddlewareArgs<'workflow_step_execute'>>[];

  constructor(callbackId: string, config: WorkflowStepOptions) {
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
        return []; // TODO :: throw error if it gets to this point?
    }
  }
}

/** Helper Functions */

export function validate(callbackId: string, config: WorkflowStepOptions): void {
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
  const requiredKeys: (keyof WorkflowStepOptions)[] = ['save', 'edit', 'execute'];
  const missingKeys: (keyof WorkflowStepOptions)[] = [];
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
  const requiredFns: (keyof WorkflowStepOptions)[] = ['save', 'edit', 'execute'];
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

function isStepEvent(args: AnyMiddlewareArgs): args is AllWorkflowStepMiddlewareArgs {
  const validTypes = new Set(['workflow_step_edit', 'workflow_step', 'workflow_step_execute']);
  return validTypes.has(args.payload.type);
}

function selectToken(context: Context): string | undefined {
  return context.botToken !== undefined ? context.botToken : context.userToken;
}

/**
 * Factory for `configure()` utility
 * @param args workflow_step_edit action
 */
function createStepConfigure(
  args: AllWorkflowStepMiddlewareArgs<SlackActionMiddlewareArgs<WorkflowStepEdit>>,
): StepConfigureFn {
  const {
    context,
    client,
    body: { callback_id, trigger_id },
  } = args;
  const token = selectToken(context);

  return (config: Parameters<StepConfigureFn>[0]) => {
    const { blocks, private_metadata, submit_disabled = false, external_id } = config;
    const view = { callback_id, blocks, private_metadata, submit_disabled, type: 'workflow_step' };

    if (external_id !== undefined) {
      // TODO :: remove ignore when external_id is added to types > View
      // @ts-ignore
      view.external_id = external_id;
    }

    return client.views.open({
      token,
      trigger_id,
      // TODO :: remove ignore when external_id is added to types > View
      // @ts-ignore
      view,
    });
  };
}

/**
 * Factory for `update()` utility
 * @param args view_submission event
 */
function createStepUpdate(
  args: AllWorkflowStepMiddlewareArgs<SlackViewMiddlewareArgs<ViewWorkflowStepSubmitAction>>,
): StepUpdateFn {
  const {
    context,
    client,
    body: {
      workflow_step: { workflow_step_edit_id },
    },
  } = args;
  const token = selectToken(context);

  return (config: Parameters<StepUpdateFn>[0]) => {
    const { step_name = '', step_image_url = '', inputs = {}, outputs = [] } = config;
    return client.workflows.updateStep({
      token,
      step_name,
      step_image_url,
      inputs,
      outputs,
      workflow_step_edit_id,
    });
  };
}

/**
 * Factory for `complete()` utility
 * @param args workflow_step_execute event
 */
function createStepComplete(
  args: AllWorkflowStepMiddlewareArgs<SlackEventMiddlewareArgs<'workflow_step_execute'>>,
): StepCompleteFn {
  const {
    context,
    client,
    payload: {
      workflow_step: { workflow_step_execute_id },
    },
  } = args;
  const token = selectToken(context);

  return (config: Parameters<StepCompleteFn>[0]) => {
    const { outputs = [] } = config;
    return client.workflows.stepCompleted({
      token,
      outputs,
      workflow_step_execute_id,
    });
  };
}

/**
 * Factory for `fail()` utility
 * @param args workflow_step_execute event
 */
function createStepFail(
  args: AllWorkflowStepMiddlewareArgs<SlackEventMiddlewareArgs<'workflow_step_execute'>>,
): StepFailFn {
  const {
    context,
    client,
    payload: {
      workflow_step: { workflow_step_execute_id },
    },
  } = args;
  const token = selectToken(context);

  return (config: Parameters<StepFailFn>[0]) => {
    const { error } = config;
    return client.workflows.stepFailed({
      token,
      error,
      workflow_step_execute_id,
    });
  };
}

/**
 * `prepareStepArgs()` takes in a workflow step's args and:
 *  1. removes the next() passed in from App-level middleware processing
 *    - events will *not* continue down global middleware chain to subsequent listeners
 *  2. augments args with step lifecycle-specific properties/utilities
 * */
export function prepareStepArgs(
  args: SlackWorkflowStepMiddlewareArgs & AllMiddlewareArgs,
): AllWorkflowStepMiddlewareArgs {
  const { next, ...stepArgs } = args;
  // const preparedArgs: AllWorkflowStepMiddlewareArgs = { ...stepArgs }; // FIXME :: will take more work to get this proper
  const preparedArgs: any = { ...stepArgs }; // TODO :: remove any

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
