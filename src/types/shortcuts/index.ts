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
