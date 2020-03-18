export * from '../shortcuts/global-shortcut';

import { GlobalShortcut } from '../shortcuts/global-shortcut';
import { SayFn, RespondFn, AckFn } from '../utilities';

/**
 * All known shortcuts from Slack.
 *
 */
export type SlackShortcut = GlobalShortcut;

/**
 * Arguments which listeners and middleware receive to process an shorcut from Slack.
 */
export interface SlackShortcutMiddlewareArgs<Shortcut extends SlackShortcut = SlackShortcut> {
  payload: Shortcut;
  shortcut: this['payload'];
  body: this['payload'];
  say: SayFn;
  respond: RespondFn;
  ack: AckFn<void>;
}
