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

export interface Container {
  message_ts: string;
  channel_id: string;
  is_ephemeral: boolean;
  thread_ts?: string;
}

export interface MessageContainer extends Container {
  type: 'message';
}

export interface MessageAttachmentContainer extends Container {
  type: 'message_attachment';
  attachment_id: number;
  is_app_unfurl: boolean;
  app_unfurl_url?: string;
}

export type KnownActions = UsersSelectResponse | StaticSelectResponse | ConversationsSelectResponse |
ChannelsSelectResponse | ExternalSelectResponse | ButtonResponse | OverflowResponse | DatepickerResponse;

export interface ActionResponse {
  block_id: string;
  action_id: string;
  action_ts: string;
  confirm?: Confirmation;
}

export interface ButtonResponse extends ActionResponse {
  type: 'button';
  value: string;
  text: PlainTextElement;
  url?: string;
}

export interface StaticSelectResponse extends ActionResponse {
  type: 'static_select';
  selected_option: {
    text: PlainTextElement,
    value: string;
  };
  initial_option?: Option;
  placeholder?: PlainTextElement;
}

export interface UsersSelectResponse extends ActionResponse {
  type: 'users_select';
  selected_user: string;
  initial_user?: string;
  placeholder?: PlainTextElement;
}

export interface ConversationsSelectResponse extends ActionResponse {
  type: 'conversations_select';
  selected_conversation: string;
  initial_conversation?: string;
  placeholder?: PlainTextElement;
}

export interface ChannelsSelectResponse extends ActionResponse {
  type: 'channels_select';
  selected_channel: string;
  initial_channel?: string;
  placeholder?: PlainTextElement;
}

export interface ExternalSelectResponse extends ActionResponse {
  type: 'external_select';
  initial_option?: Option;
  placeholder?: PlainTextElement;
  min_query_length?: number;
}

export interface OverflowResponse extends ActionResponse {
  type: 'overflow';
  selected_option: {
    text: PlainTextElement,
    value: string;
  };
}

export interface DatepickerResponse extends ActionResponse {
  type: 'datepicker';
  selected_date: string;
  initial_date?: string;
  placeholder?: PlainTextElement;
}

export interface Actions<Action extends KnownActions> extends KeyValueMapping {
  type: 'block_actions';
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
  message?: {
    type: 'message';
    user?: string; // undocumented that this is optional, it won't be there for bot messages
    ts: string;
    text?: string; // undocumented that this is optional, but how could it exist on block kit based messages?
    [key: string]: any;
  };
  app_unfurl?: KeyValueMapping;
  container: MessageContainer | MessageAttachmentContainer;
  token: string;
  response_url: string;
  trigger_id: string;
  api_app_id: string;
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

export type SlackAction =
  | InteractiveMessage<ButtonClick>
  | InteractiveMessage<MenuSelect>
  | DialogSubmitAction
  | MessageAction
  | KnownActions;

type ActionAckFn<T extends SlackAction> =
  T extends InteractiveMessage<ButtonClick | MenuSelect> ?
    AckFn<string | SayArguments> :
  T extends DialogSubmitAction ?
    AckFn<DialogValidation> :
  AckFn<void>;

export interface SlackActionMiddlewareArgs<ActionType extends SlackAction> {
  payload: ActionType;
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
 * Slack Options Types
 */

export interface ExternalOptionsRequest<Type> {
  name: string;
  value: string;
  callback_id: string;
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
  action_ts: string;
  message_ts?: string; // not when within a dialog
  attachment_id?: string; // not when within a dialog
  token: string;
}

export interface Option {
  label: string;
  value: string;
}

// TODO: there's a lot of repetition in the following type. factor out some common parts.
// tslint:disable:max-line-length
type OptionsAckFn<Within extends 'interactive_message' | 'dialog_suggestion'> =
  Within extends 'interactive_message' ?
    AckFn<{ options: { text: string; value: string; }[]; option_groups: { label: string; options: { text: string; value: string; }[]; }[]; }> :
  AckFn<{ options: { label: string; value: string; }[]; option_groups: { label: string; options: { label: string; value: string; }[]; }[]; }>;
// tslint:enable:max-line-length

export interface SlackOptionsMiddlewareArgs<Within extends 'interactive_message' | 'dialog_suggestion'> {
  payload: ExternalOptionsRequest<Within>;
  body: this['payload'];
  ack: OptionsAckFn<Within>;
}

/*
 * General Type helpers
 */

export type AnyMiddlewareArgs =
  | SlackEventMiddlewareArgs<string>
  | SlackActionMiddlewareArgs<SlackAction>
  | SlackCommandMiddlewareArgs
  | SlackOptionsMiddlewareArgs<'interactive_message' | 'dialog_suggestion'>;

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
type SayArguments = {
  [Arg in keyof ChatPostMessageArguments]: Arg extends 'channel' ?
    (ChatPostMessageArguments[Arg] | undefined) : ChatPostMessageArguments[Arg];
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

export interface ConstraintObject {
  block_id?: string | RegExp;
  action_id?: string | RegExp;
  callback_id?: string | RegExp;
}
