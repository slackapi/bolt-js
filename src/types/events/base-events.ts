import { StringIndexed } from '../helpers';

/**
 * All known event types in Slack's Events API
 *
 * This is a discriminated union. The discriminant is the `type` property.
 */
export type SlackEvent =
  | AppMentionEvent
  | GroupOpenEvent
  | EmojiChangedEvent
  | MessageEvent;

/**
 * Any event in Slack's Events API
 *
 * This type is used to represent events that aren't known ahead of time. Each of the known event types also implement
 * this interface. That condition isn't enforced, since we're not interested in factoring out common properties from the
 * known event types.
 */
export interface BasicSlackEvent<Type extends string = string> extends StringIndexed {
  type: Type;
}

/* ------- TODO: Generate these interfaces ------- */

// NOTE: this is not a great example because it actually should get its shape from a message event
export interface AppMentionEvent extends StringIndexed {
  type: 'app_mention';
  user: string;
  text: string;
  ts: string;
  channel: string;
  event_ts: string;
}

export interface GroupOpenEvent extends StringIndexed {
  type: 'group_open';
  user: string;
  channel: string;
}

// NOTE: this should probably be broken into its two subtypes
export interface EmojiChangedEvent extends StringIndexed {
  type: 'emoji_changed';
  subtype: 'add' | 'remove';
  names?: string[];
  name?: string;
  value?: string;
  event_ts: string;
}

// TODO: this is just a draft of the actual message event
export interface MessageEvent extends StringIndexed {
  type: 'message';
  channel: string;
  user: string;
  text: string;
  ts: string;
}
