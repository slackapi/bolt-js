// export * from './message-action';
export * from '../shortcuts/global-shortcut';

// import { MessageAction } from './message-action';
import { GlobalShortcut } from '../shortcuts/global-shortcut';
import { SayFn, RespondFn, AckFn } from '../utilities';

/**
 * All known actions from Slack's Block Kit interactive components, message actions, dialogs, and legacy interactive
 * messages.
 *
 */
export type SlackShortcut = GlobalShortcut;

/**
 * Arguments which listeners and middleware receive to process an action from Slack's Block Kit interactive components,
 * message actions, dialogs, or legacy interactive messages.
 *
 * The type parameter `Action` represents the entire JSON-encoded request body from Slack. The generic type
 * `BlockAction<ElementAction>` can be used to create a type for this parameter based on an element's action type. In
 * this case `ElementAction` must extend `BasicElementAction`.
 */
export interface SlackShortcutMiddlewareArgs<Shortcut extends SlackShortcut = SlackShortcut> {
  payload: Shortcut;
  shortcut: this['payload'];
  body: this['payload'];
  say: SayFn;
  respond: RespondFn;
  // ack: ShortcutAckFn<Shortcut>;
  ack: AckFn<void>;
}

/**
 * Type function which given an action `A` returns a corresponding type for the `ack()` function. The function is used
 * to acknowledge the receipt (and possibly signal failure) of an action from a listener or middleware.
 */
// type ShortcutAckFn<S extends SlackShortcut> =
  // AckFn<void>;
