import { ChatPostMessageArguments } from '@slack/web-api';

// TODO: remove the following pragma after TSLint to ESLint transformation is complete
/* tslint:disable:completed-docs */

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

interface KeyValueMapping {
  [key: string]: any;
}

export interface UnknownSlackEvent<Type> extends KeyValueMapping {
  type: Type;
}

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
  // TODO: make this a conditional on whether the event has channel context
  say: SayFn;
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
  | MessageAction;

export interface SlackActionMiddlewareArgs<ActionType extends SlackAction> {
  payload: ActionType;
  action: this['payload'];
  body: this['payload'];
  ack: ActionAckFn<ActionType>;
  // TODO: make this conditional on whether the action has a response_url
  respond: RespondFn;
  // TODO: make this a conditional on whether the action has channel context (all but dialogs, i think)
  say: SayFn;
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
  // ack: Ack<Message>;
  respond: RespondFn;
  say: SayFn;
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

// TODO: figure out if this is a precise enough definition
type RespondArguments = ChatPostMessageArguments & {
  /** Response URLs can be used to send ephemeral messages or in-channel messages using this argument */
  response_type?: 'in_channel' | 'ephemeral';
};

export interface RespondFn {
  (message: string | RespondArguments): void;
}

// TODO: this probably also needs to be a generic with a type parameter describing the shape of the response expected.
export interface AckFn<Response> {
  (response?: Response): void;
}
