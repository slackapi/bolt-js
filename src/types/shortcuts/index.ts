import { MessageShortcut } from './message-shortcut';
import { GlobalShortcut } from './global-shortcut';
import { SayFn, RespondFn, AckFn } from '../utilities';

// export * from './message-action';
export * from './global-shortcut';
export * from './message-shortcut';

/**
 * All known shortcuts from Slack.
 */
export type SlackShortcut = GlobalShortcut | MessageShortcut;

/**
 * Arguments which listeners and middleware receive to process a shortcut from Slack.
 *
 * The type parameter `Shortcut` represents the entire JSON-encoded request body from Slack.
 */
export interface SlackShortcutMiddlewareArgs<Shortcut extends SlackShortcut = SlackShortcut> {
  payload: Shortcut;
  shortcut: this['payload'];
  body: this['payload'];
  say: Shortcut extends MessageShortcut ? SayFn : undefined;
  respond: RespondFn;
  ack: AckFn<void>;
}
