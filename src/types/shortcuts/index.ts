import type { AckFn, RespondFn, SayFn } from '../utilities';
import type { GlobalShortcut } from './global-shortcut';
import type { MessageShortcut } from './message-shortcut';

// export * from './message-action';
export * from './global-shortcut';
export * from './message-shortcut';

/**
 * All known shortcuts from Slack.
 */
export type SlackShortcut = GlobalShortcut | MessageShortcut;

export interface ShortcutConstraints<S extends SlackShortcut = SlackShortcut> {
  type?: S['type'];
  callback_id?: string | RegExp;
}

/**
 * Arguments which listeners and middleware receive to process a shortcut from Slack.
 *
 * The type parameter `Shortcut` represents the entire JSON-encoded request body from Slack.
 */
export type SlackShortcutMiddlewareArgs<Shortcut extends SlackShortcut = SlackShortcut> = {
  payload: Shortcut;
  shortcut: Shortcut;
  body: Shortcut;
  respond: RespondFn;
  ack: AckFn<void>;
} & (Shortcut extends MessageShortcut
  ? { say: SayFn }
  : unknown
);
