import type { FunctionCompleteFn, FunctionFailFn } from '../../CustomFunction';
import type { FunctionInputs } from '../events';
import type { AckFn, RespondFn, SayArguments, SayFn } from '../utilities';
import type { BlockAction } from './block-action';
import type { DialogSubmitAction, DialogValidation } from './dialog-action';
import type { InteractiveMessage } from './interactive-message';
import type { WorkflowStepEdit } from './workflow-step-edit';

export * from './block-action';
export * from './interactive-message';
export * from './dialog-action';
// TODO: remove workflow step stuff in bolt v5
export * from './workflow-step-edit';

/**
 * All known actions from Slack's Block Kit interactive components, message actions, dialogs, and legacy interactive
 * messages.
 *
 * TODO: BlockAction's default generic parameter (ElementAction) might be too specific to allow for this type to be used
 * as a constraint on SlackActionMiddlewareArgs' Action generic parameter.
 *
 * If someone were to instantiate SlackActionMiddlewareArgs<BlockAction<SomeNewAction>>, would it work? We need it to
 * work as long as SomeNewAction implements BasicElementAction.
 *
 * We don't want to substitute BlockAction with BlockAction<BasicElementAction> here because that means the completions
 * offered when no generic parameter is bound would be limited to BasicElementAction rather than the union of known
 * actions - ElementAction.
 */
// TODO: remove workflow step stuff in bolt v5
export type SlackAction = BlockAction | InteractiveMessage | DialogSubmitAction | WorkflowStepEdit;

export interface ActionConstraints<A extends SlackAction = SlackAction> {
  type?: A['type'];
  block_id?: A extends BlockAction ? string | RegExp : never;
  action_id?: A extends BlockAction ? string | RegExp : never;
  // TODO: callback ID doesn't apply to block actions, so the SlackAction generic above is too wide to apply here.
  // biome-ignore lint/suspicious/noExplicitAny: TODO: for better type safety, we may want to revisit this
  callback_id?: Extract<A, { callback_id?: string }> extends any ? string | RegExp : never;
}

// TODO: the words (terminology) that follow don't make much sense. What differentiates SlackAction, BlockAction, ElementAction and BasicElementAction?
/**
 * Arguments which listeners and middleware receive to process an action from Slack's Block Kit interactive components,
 * message actions, dialogs, or legacy interactive messages.
 *
 * The type parameter `Action` represents the entire JSON-encoded request body from Slack. The generic type
 * `BlockAction<ElementAction>` can be used to create a type for this parameter based on an element's action type. In
 * this case `ElementAction` must extend `BasicElementAction`.
 */
export type SlackActionMiddlewareArgs<Action extends SlackAction = SlackAction> = {
  payload: Action extends BlockAction<infer ElementAction>
  ? ElementAction
  : Action extends InteractiveMessage<infer InteractiveAction>
  ? InteractiveAction
  : Action;
  // too bad we can't use `this['payload']` in a type (as opposed to interface) but the use of `& unknown` below is too useful
  action: Action extends BlockAction<infer ElementAction>
  ? ElementAction
  : Action extends InteractiveMessage<infer InteractiveAction>
  ? InteractiveAction
  : Action;
  body: Action;
  respond: RespondFn;
  ack: ActionAckFn<Action>;
  // TODO: can we conditionally apply these custom-function-specific properties only in certain situations? how can we get function-scoped interactivity events included in the generics?
  complete?: FunctionCompleteFn;
  fail?: FunctionFailFn;
  inputs?: FunctionInputs;
// TODO: remove workflow step stuff in bolt v5
} & (Action extends Exclude<SlackAction, DialogSubmitAction | WorkflowStepEdit>
  ? // all action types except dialog submission and steps from apps have a channel context
  { say: SayFn }
  : unknown);

/**
 * Type function which given an action `A` returns a corresponding type for the `ack()` function. The function is used
 * to acknowledge the receipt (and possibly signal failure) of an action from a listener or middleware.
 */
type ActionAckFn<A extends SlackAction> = A extends InteractiveMessage
  ? AckFn<string | SayArguments>
  : A extends DialogSubmitAction
  ? AckFn<DialogValidation> // message action and block actions don't accept any value in the ack response
  : AckFn<void>;
