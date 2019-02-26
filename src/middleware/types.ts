/*
 * Future generated types from Async API Spec
 */
// NOTE: this is not a great example because it actually should get its shape from a message event
export interface AppMentionEvent {
  type: 'app_mention';
  user: string;
  text: string;
  ts: string;
  channel: string;
  event_ts: string;
}

export interface GroupOpenEvent {
  type: 'group_open';
  user: string;
  channel: string;
}

// NOTE: this should probably be broken into its two subtypes
export interface EmojiChangedEvent {
  type: 'emoji_changed';
  subtype: 'add' | 'remove';
  names?: string[];
  name?: string;
  value?: string;
  event_ts: string;
}

export type SlackEvent =
  | AppMentionEvent
  | GroupOpenEvent
  | EmojiChangedEvent;

/*
 * Slack Events API Types
 */

export interface UnknownSlackEvent {
  type: string;
}

type KnownEventFromType<T extends string> = Extract<SlackEvent, { type: T }>;
type EventFromType<T extends string> = KnownEventFromType<T> extends never ? UnknownSlackEvent : KnownEventFromType<T>;

export interface SlackEventMiddlewareArgs<EventType extends string> {
  payload: EventFromType<EventType>;
  event: this['payload'];
  // message: IsMessageEvent<E>;
  // body: SlackEventBody<E>;
  // say: HasChannelContext<E>;
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
  // TODO: figure out if type is really there
  // type: 'select';
  name: string;
  selected_options: {
    value: string;
  }[];
}

export type InteractiveActions = ButtonClick | MenuSelect;

// TODO: should we just leave the two InteractiveActions as separate interfaces?
// TODO: how much of this can be a part of ActionFromType?
export interface InteractiveMessage<Action extends InteractiveActions> {
  type: 'interactive_message';
  callback_id: string;
  actions: [Action];
  team: {
    id: string;
    domain: string;
  };
  user: {
    id: string;
    name: string;
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

  // NOTE: the original_message is not available from ephemeral messages
  // TODO: confirm optionality of message_ts, if these are always either both available or neither, how can the type
  // system express that?
  message_ts?: string;
  original_message?: { [key: string]: string; };
}

export interface DialogSubmitAction {
  type: 'dialog_submission';
  callback_id: string;
  submission: { [name: string]: string };
  state?: string;
  team: {
    id: string;
    domain: string;
  };
  user: {
    id: string;
    name: string;
  };
  channel: {
    id: string;
    name: string;
  };
  action_ts: string;
  token: string;
  response_url: string;
}

// TODO: revisit naming
// TODO: is there an actions property in this type? docs don't suggest so, but @slack/interactive-messages comments
// would have me believe so (but would still function properly without it)
// TODO: is this the only one that doesn't have an action_ts?
export interface MessageAction {
  type: 'message_action';
  callback_id: string;
  trigger_id: string;
  response_url: string;
  // TODO: are all of these really non-optional?
  message: {
    type: 'message';
    user: string;
    ts: string;
    text: string;
  };
  user: {
    id: string;
    name: string;
  };
  channel: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    domain: string;
  };
  token: string;
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
  // say: HasChannelContext<ActionType>;
  // ack: Ack<ActionType>;
  // respond: HasResponseUrl<ActionType>;
}

/*
 * Slack Command Types
 */

export interface SlackCommandMiddlewareArgs {
  payload: {
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
  };
  command: this['payload'];
  body: this['payload'];
  // say: Say;
  // ack: Ack<Message>;
  // respond: Respond;
}

/*
 * Slack Options Types
 */

export interface SlackOptionsMiddlewareArgs<Within extends 'interactive_message' | 'dialog_suggestion'> {
  payload: {
    name: string;
    value: string;
    callback_id: string;
    type: Within,
    team: {
      id: string;
      domain: string;
    };
    channel: {
      id: string;
      name: string;
    };
    user: {
      id: string;
      name: string;
    },
    action_ts: string;
    message_ts?: string; // not in a dialog
    attachment_id?: string; // not in a dialog
    token: string;
  };
  body: this['payload'];
  // ack: Ack<Within>;
}

/*
 * General Type helpers
 */

// Use with caution
export type AnyMiddlewareArgs =
  | SlackEventMiddlewareArgs<string>
  | SlackActionMiddlewareArgs<SlackAction>
  | SlackCommandMiddlewareArgs
  | SlackOptionsMiddlewareArgs<'interactive_message' | 'dialog_suggestion'>;

export interface Middleware<Args extends AnyMiddlewareArgs> {
  // TODO: is there something nice we can do to get context's property types to flow from one middleware to the next?
  (args: Args & { next: NextMiddleware, context: { [key: string]: any } }): void;
}

export interface NextMiddleware {
  (error: Error): void;
  (postProcess: (error: Error | undefined, done: (error?: Error) => void) => any): void;
  (): void;
}
