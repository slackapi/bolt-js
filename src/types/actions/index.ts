export * from './block-action';
export * from './interactive-message';
export * from './dialog-action';
export * from './message-action';

import { BlockAction } from './block-action';
import { InteractiveMessage } from './interactive-message';
import { DialogSubmitAction, DialogValidation } from './dialog-action';
import { MessageAction } from './message-action';
import { SayFn, SayArguments, RespondFn, AckFn } from '../utilities';

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
export type SlackAction = BlockAction | InteractiveMessage | DialogSubmitAction | MessageAction;

/**
 * Arguments which listeners and middleware receive to process an action from Slack's Block Kit interactive components,
 * message actions, dialogs, or legacy interactive messages.
 *
 * The type parameter `Action` represents the entire JSON-encoded request body from Slack. The generic type
 * `BlockAction<ElementAction>` can be used to create a type for this parameter based on an element's action type. In
 * this case `ElementAction` must extend `BasicElementAction`.
 */
export interface SlackActionMiddlewareArgs<Action extends SlackAction = SlackAction> {
  payload: (
    Action extends BlockAction<infer ElementAction> ? ElementAction :
    Action extends InteractiveMessage<infer InteractiveAction> ? InteractiveAction :
    Action
  );
  action: this['payload'];
  body: Action;
  // all action types except dialog submission have a channel context
  say: Action extends Exclude<SlackAction, DialogSubmitAction> ? SayFn : never;
  respond: RespondFn;
  ack: ActionAckFn<Action>;
}

/**
 * Type function which given an action `A` returns a corresponding type for the `ack()` function. The function is used
 * to acknowledge the receipt (and possibly signal failure) of an action from a listener or middleware.
 */
type ActionAckFn<A extends SlackAction> =
  A extends InteractiveMessage ? AckFn<string | SayArguments> :
  A extends DialogSubmitAction ? AckFn<DialogValidation> :
  // message action and block actions don't accept any value in the ack response
  AckFn<void>;
