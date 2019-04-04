// TODO: import element interfaces from @slack/types
import { ChatPostMessageArguments, PlainTextElement, Option, Confirmation } from '@slack/web-api';

/*
 * Future generated types from Async API Spec
 */
// NOTE: this is not a great example because it actually should get its shape from a message event
export interface AppMentionEvent extends KeyValueMapping {
  type: 'app_mention';
  user: string;
  text: string;
  ts: string;
  channel: string;
  event_ts: string;
}

export interface GroupOpenEvent extends KeyValueMapping {
  type: 'group_open';
  user: string;
  channel: string;
}

// NOTE: this should probably be broken into its two subtypes
export interface EmojiChangedEvent extends KeyValueMapping {
  type: 'emoji_changed';
  subtype: 'add' | 'remove';
  names?: string[];
  name?: string;
  value?: string;
  event_ts: string;
}

// TODO: this is just a draft of the actual message event
export interface MessageEvent extends KeyValueMapping {
  type: 'message';
  channel: string;
  user: string;
  text: string;
  ts: string;
}

// TODO: script to generate these types

export type SlackEvent =
  | AppMentionEvent
  | GroupOpenEvent
  | EmojiChangedEvent
  | MessageEvent;

/*
 * Slack Events API Types
 */
export interface KeyValueMapping {
  [key: string]: any;
}

export interface UnknownSlackEvent<Type> extends KeyValueMapping {
  type: Type;
}

// TODO: test this
type WhenEventHasChannelContext<Event, Type> =
  Event extends ({ channel: string; } | { item: { channel: string; }; }) ? Type : never;

type KnownEventFromType<T extends string> = Extract<SlackEvent, { type: T }>;
type EventFromType<T extends string> = KnownEventFromType<T> extends never ?
  UnknownSlackEvent<T> : KnownEventFromType<T>;

interface WrappedSlackEvent<EventBody> extends KeyValueMapping {
  token: string;
  team_id: string;
  enterprise_id?: string;
  api_app_id: string;
  event: EventBody;
  type: 'event_callback';
  event_id: string;
  event_time: number;
  // TODO: is this optional?
  authed_users: string[];
}

export interface SlackEventMiddlewareArgs<EventType extends string> {
  payload: EventFromType<EventType>;
  event: this['payload'];
  message: EventType extends 'message' ? this['payload'] : never;
  body: WrappedSlackEvent<this['payload']>;
  say: WhenEventHasChannelContext<EventFromType<EventType>, SayFn>;
}

/*
 * Slack Action Types
 */

export interface ButtonClick {
  type: 'button';
  name: string;
  value: string;
}

export interface MenuSelect {
  type: 'select';
  name: string;
  selected_options: {
    value: string;
  }[];
}

export type InteractiveAction = ButtonClick | MenuSelect;

export interface InteractiveMessage<Action extends InteractiveAction> extends KeyValueMapping {
  type: 'interactive_message';
  callback_id: string;
  actions: [Action];
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // undocumented
    enterprise_name?: string; // undocumented
  };
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  channel: {
    id: string;
    name: string;
  };
  action_ts: string;
  attachment_id?: string;
  token: string;
  response_url: string;
  trigger_id: string;
  is_app_unfurl?: boolean; // undocumented
  // NOTE: the original_message is not available from ephemeral messages
  // TODO: confirm optionality of message_ts, if these are always either both available or neither, how can the type
  // system express that?
  message_ts?: string;
  original_message?: { [key: string]: string; };
}

// this interface is "abstract", and not meant to be used on its own. it just helps DRY up the following interfaces
// TODO: consider distributing this back into all the individual element actions
interface BaseElementAction {
  block_id: string;
  action_id: string;
  action_ts: string;
  // TODO: figure out when this is actually available
  confirm?: Confirmation;
}

export interface ButtonAction extends BaseElementAction {
  type: 'button';
  value: string;
  text: PlainTextElement;
  url?: string;
}

export interface StaticSelectAction extends BaseElementAction {
  type: 'static_select';
  selected_option: {
    text: PlainTextElement,
    value: string;
  };
  initial_option?: Option;
  placeholder?: PlainTextElement;
}

export interface UsersSelectAction extends BaseElementAction {
  type: 'users_select';
  selected_user: string;
  initial_user?: string;
  placeholder?: PlainTextElement;
}

export interface ConversationsSelectAction extends BaseElementAction {
  type: 'conversations_select';
  selected_conversation: string;
  initial_conversation?: string;
  placeholder?: PlainTextElement;
}

export interface ChannelsSelectAction extends BaseElementAction {
  type: 'channels_select';
  selected_channel: string;
  initial_channel?: string;
  placeholder?: PlainTextElement;
}

export interface ExternalSelectAction extends BaseElementAction {
  type: 'external_select';
  initial_option?: Option;
  placeholder?: PlainTextElement;
  min_query_length?: number;
}

export interface OverflowAction extends BaseElementAction {
  type: 'overflow';
  selected_option: {
    text: PlainTextElement,
    value: string;
  };
}

export interface DatepickerAction extends BaseElementAction {
  type: 'datepicker';
  selected_date: string;
  initial_date?: string;
  placeholder?: PlainTextElement;
}

export type ElementAction =
  | ButtonAction
  | UsersSelectAction
  | StaticSelectAction
  | ConversationsSelectAction
  | ChannelsSelectAction
  | ExternalSelectAction
  | OverflowAction
  | DatepickerAction;

export interface UnknownElementAction<Type> extends BaseElementAction, KeyValueMapping {
  type: Type;
}

type KnownActionFromElementType<T extends string> = Extract<ElementAction, { type: T }>;
type ActionFromElementType<T extends string> = KnownActionFromElementType<T> extends never ?
  UnknownElementAction<T> : KnownActionFromElementType<T>;

export interface BlockAction<ElementType extends string> extends KeyValueMapping {
  type: 'block_actions';
  actions: [ActionFromElementType<ElementType>];
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // undocumented
    enterprise_name?: string; // undocumented
  };
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  channel: {
    id: string;
    name: string;
  };
  message?: {
    type: 'message';
    user?: string; // undocumented that this is optional, it won't be there for bot messages
    ts: string;
    text?: string; // undocumented that this is optional, but how could it exist on block kit based messages?
    [key: string]: any;
  };
  token: string;
  response_url: string;
  trigger_id: string;
  api_app_id: string;

  // TODO: we'll need to fill this out a little more carefully in the future, possibly using a generic parameter
  container: KeyValueMapping;

  // this appears in the block_suggestions schema, but we're not sure when its present or what its type would be
  app_unfurl?: any;
}

export interface DialogSubmitAction extends KeyValueMapping {
  type: 'dialog_submission';
  callback_id: string;
  submission: { [name: string]: string };
  state: string;
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // undocumented
    enterprise_name?: string; // undocumented
  };
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  channel: {
    id: string;
    name: string;
  };
  action_ts: string;
  token: string;
  response_url: string;
}

export interface DialogValidation {
  errors: {
    name: string;
    error: string;
  }[];
}

export interface MessageAction extends KeyValueMapping {
  type: 'message_action';
  callback_id: string;
  trigger_id: string;
  message_ts: string; // undocumented
  response_url: string;
  // TODO: are all of these really non-optional?
  message: {
    type: 'message';
    user?: string; // undocumented that this is optional, it won't be there for bot messages
    ts: string;
    text?: string; // undocumented that this is optional, but how could it exist on block kit based messages?
    [key: string]: any;
  };
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  channel: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // undocumented
    enterprise_name?: string; // undocumented
  };
  token: string;
  action_ts: string; // undocumented
}

export type SlackAction<ElementType extends string = string> =
  | BlockAction<ElementType>
  | InteractiveMessage<ButtonClick>
  | InteractiveMessage<MenuSelect>
  | DialogSubmitAction
  | MessageAction;

type ActionAckFn<T extends SlackAction> =
  T extends InteractiveMessage<ButtonClick | MenuSelect> ?
    AckFn<string | SayArguments> :
  T extends DialogSubmitAction ?
    AckFn<DialogValidation> :
  // message action and block actions don't accept any value in the ack response
  AckFn<void>;

export interface SlackActionMiddlewareArgs<ActionType extends SlackAction> {
  payload: ActionType;
  // TODO: should the following value actually contain the unwrapped action payload?
  // DialogSubmitAction and MessageAction don't have an actions property, so what would they contain?
  action: this['payload'];
  body: this['payload'];
  // all action types except dialog submission have a channel context
  say: ActionType extends Exclude<SlackAction, DialogSubmitAction> ? SayFn : never;
  respond: RespondFn;
  ack: ActionAckFn<ActionType>;
}

/*
 * Slack Command Types
 */

export interface SlashCommand extends KeyValueMapping {
  token: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
  user_id: string;
  user_name: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  enterprise_id?: string;
  enterprise_name?: string;
}

export interface SlackCommandMiddlewareArgs {
  payload: SlashCommand;
  command: this['payload'];
  body: this['payload'];
  say: SayFn;
  respond: RespondFn;
  ack: AckFn<string | RespondArguments>;
}

/*
 * Slack Dialog and Interactive Messages Options Types
 */

export type OptionsSource = 'interactive_message' | 'dialog_suggestion' | 'block_suggestion';

export interface OptionsRequest<Type extends OptionsSource> extends KeyValueMapping {
  value: string;
  type: Type;
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // undocumented
    enterprise_name?: string; // undocumented
  };
  channel: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  token: string;

  name: Type extends 'interactive_message' | 'dialog_suggestion' ? string : never;
  callback_id: Type extends 'interactive_message' | 'dialog_suggestion' ? string : never;
  action_ts:  Type extends 'interactive_message' | 'dialog_suggestion' ? string : never;

  message_ts: Type extends 'interactive_message' ? string : never;
  attachment_id: Type extends 'interactive_message' ? string : never;

  api_app_id: Type extends 'block_suggestion' ? string : never;
  action_id: Type extends 'block_suggestion' ? string : never;
  block_id: Type extends 'block_suggestion' ? string : never;
  container: Type extends 'block_suggestion' ?  KeyValueMapping : never;

  // this appears in the block_suggestions schema, but we're not sure when its present or what its type would be
  app_unfurl?: any;
}

// TODO: there's a lot of repetition in the following type. factor out some common parts.
// tslint:disable:max-line-length
type OptionsAckFn<Source extends OptionsSource> =
  Source extends 'block_suggestion' ?
    AckFn<{ options: Option[]; option_groups: { label: string; options: Option[]; }[]; }> :
  Source extends 'interactive_message' ?
    AckFn<{ options: { text: string; value: string; }[]; option_groups: { label: string; options: { text: string; value: string; }[]; }[]; }> :
  AckFn<{ options: { label: string; value: string; }[]; option_groups: { label: string; options: { label: string; value: string; }[]; }[]; }>;
// tslint:enable:max-line-length

export interface SlackOptionsMiddlewareArgs<Source extends OptionsSource> {
  payload: OptionsRequest<Source>;
  body: this['payload'];
  option: this['payload'];
  // TODO: consider putting an options property in here, just so that middleware don't have to parse the body to decide
  // what kind of event this is
  ack: OptionsAckFn<Source>;
}

/*
 * General Type helpers
 */

export type AnyMiddlewareArgs =
  | SlackEventMiddlewareArgs<string>
  | SlackActionMiddlewareArgs<SlackAction>
  | SlackCommandMiddlewareArgs
  | SlackOptionsMiddlewareArgs<OptionsSource>;

export interface Context extends KeyValueMapping {
}

// NOTE: Args should extend AnyMiddlewareArgs, but because of contravariance for function types, including that as a
// constraint would mess up the interface of Slapp#event(), Slapp#message(), etc.
export interface Middleware<Args> {
  // TODO: is there something nice we can do to get context's property types to flow from one middleware to the next?
  (args: Args & { next: NextMiddleware, context: Context }): void;
}

export interface NextMiddleware {
  (error: Error): void;
  (postProcess: PostProcessFn): void;
  (): void;
}

export interface PostProcessFn {
  // TODO: should the return value any be unknown type?
  (error: Error | undefined, done: (error?: Error) => void): any;
}

// The say() utility function binds the message to the same channel as the incoming message that triggered the
// listener. Therefore, specifying the `channel` argument is not required.
type SayArguments = Pick<ChatPostMessageArguments, Exclude<KnownKeys<ChatPostMessageArguments>, 'channel'>> & {
  channel?: string;
};

export interface SayFn {
  (message: string | SayArguments): void;
}

type RespondArguments = SayArguments & {
  /** Response URLs can be used to send ephemeral messages or in-channel messages using this argument */
  response_type?: 'in_channel' | 'ephemeral';
  replace_original?: boolean;
  delete_original?: boolean;
};

export interface RespondFn {
  (message: string | RespondArguments): void;
}

export interface AckFn<Response> {
  (response?: Response): void;
}

export interface ActionConstraints {
  block_id?: string | RegExp;
  action_id?: string | RegExp;
  callback_id?: string | RegExp;
}

/**
 * Type helpers
 */
type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;
