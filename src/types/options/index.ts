import type { Option, PlainTextElement } from '@slack/types';
import type { AckFn, StringIndexed, XOR } from '../utilities';
import type { ViewOutput } from '../view/index';

/**
 * Arguments which listeners and middleware receive to process an options request from Slack
 */
export interface SlackOptionsMiddlewareArgs<Source extends OptionsSource = OptionsSource> {
  payload: OptionsPayloadFromType<Source>;
  body: this['payload'];
  options: this['payload'];
  ack: OptionsAckFn<Source>;
}

export type SlackOptions = BlockSuggestion | InteractiveMessageSuggestion | DialogSuggestion;

// TODO: more strict typing to allow block/action_id for block_suggestion - not all of these properties apply to all of the members of the SlackOptions union
export interface OptionsConstraints<A extends SlackOptions = SlackOptions> {
  type?: A['type'];
  block_id?: A extends SlackOptions ? string | RegExp : never;
  action_id?: A extends SlackOptions ? string | RegExp : never;
  // biome-ignore lint/suspicious/noExplicitAny: TODO: for better type safety, we may want to revisit this
  callback_id?: Extract<A, { callback_id?: string }> extends any ? string | RegExp : never;
}

// TODO: why call this 'source'? shouldn't it be Type, since it is just the type value?
/**
 * All sources from which Slack sends options requests.
 */
export type OptionsSource = SlackOptions['type'];

// TODO: the following three utility typies could be DRYed up w/ the similar KnownEventFromType utility used in events types
export interface BasicOptionsPayload<Type extends string = string> {
  type: Type;
  value: string;
}
// TODO: Is this useful? Events have something similar
export type OptionsPayloadFromType<T extends string> = KnownOptionsPayloadFromType<T> extends never
  ? BasicOptionsPayload<T>
  : KnownOptionsPayloadFromType<T>;
export type KnownOptionsPayloadFromType<T extends string> = Extract<SlackOptions, { type: T }>;

/**
 * external data source in blocks
 */
export interface BlockSuggestion extends StringIndexed {
  type: 'block_suggestion';
  block_id: string;
  action_id: string;
  value: string;

  api_app_id: string;
  team: {
    id: string;
    domain: string;
    enterprise_id?: string;
    enterprise_name?: string;
  } | null;
  channel?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    team_id?: string;
  };
  token: string; // legacy verification token
  container: StringIndexed;
  // exists for blocks in either a modal or a home tab
  view?: ViewOutput;
  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/**
 * external data source in attachments
 */
export interface InteractiveMessageSuggestion extends StringIndexed {
  type: 'interactive_message';
  name: string;
  value: string;
  callback_id: string;
  action_ts: string;
  message_ts: string;
  attachment_id: string;

  team: {
    id: string;
    domain: string;
    enterprise_id?: string;
    enterprise_name?: string;
  } | null;
  channel?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    team_id?: string;
  };
  token: string; // legacy verification token
  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/**
 * external data source in dialogs
 */
export interface DialogSuggestion extends StringIndexed {
  type: 'dialog_suggestion';
  name: string;
  value: string;
  callback_id: string;
  action_ts: string;

  team: {
    id: string;
    domain: string;
    enterprise_id?: string;
    enterprise_name?: string;
  } | null;
  channel?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    team_id?: string;
  };
  token: string; // legacy verification token
  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/**
 * Type function which given an options source `Source` returns a corresponding type for the `ack()` function. The
 * function is used to fulfill the options request from a listener or middleware.
 */
type OptionsAckFn<Source extends OptionsSource> = Source extends 'block_suggestion'
  ? AckFn<XOR<BlockOptions, OptionGroups<BlockOptions>>>
  : Source extends 'interactive_message'
    ? AckFn<XOR<MessageOptions, OptionGroups<MessageOptions>>>
    : AckFn<XOR<DialogOptions, DialogOptionGroups<DialogOptions>>>;

// TODO: why are the next two interfaces identical?
export interface BlockOptions {
  options: Option[];
}
export interface MessageOptions {
  options: Option[];
}
export interface DialogOptions {
  options: {
    label: string;
    value: string;
  }[];
}
export interface OptionGroups<Options> {
  option_groups: ({
    label: PlainTextElement;
  } & Options)[];
}
export interface DialogOptionGroups<Options> {
  option_groups: ({
    label: string;
  } & Options)[];
}
