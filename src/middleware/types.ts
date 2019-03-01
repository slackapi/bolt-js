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

// TODO: script to generate these types

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

/*
Example that includes event wrapper from a workspace in an enterprise
{
    "token": "FkUFnKpO1ugIMmKQeE5nwaj6",
    "team_id": "T33J49SAG",
    "enterprise_id": "E2FBKA8E7",
    "api_app_id": "AGM9XEVQF",
    "event": {
        "client_msg_id": "8610840a-a014-4be2-8ff4-7d97dcc94ae0",
        "type": "message",
        "text": "hello",
        "user": "W2P533DNJ",
        "ts": "1551411278.000700",
        "channel": "CGL4ERM5H",
        "event_ts": "1551411278.000700",
        "channel_type": "channel"
    },
    "type": "event_callback",
    "event_id": "EvGMA2FPQX",
    "event_time": 1551411278,
    "authed_users": [
        "WGL816CLA"
    ]
}
*/

export interface SlackEventMiddlewareArgs<EventType extends string> {
  payload: EventFromType<EventType>;
  event: this['payload'];
  message: EventType extends 'message' ? this['payload'] : never;
  body: SlackEventBody<E>;
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

export type InteractiveAction = ButtonClick | MenuSelect;

/*
example from enterprise of button click
{"type":"interactive_message","actions":[{"name":"game","type":"button","value":"maze"}],"callback_id":"wopr_game","team":{"id":"T33J49SAG","domain":"acme-demo-ebc","enterprise_id":"E2FBKA8E7","enterprise_name":"Acme Org"},"channel":{"id":"CGL4ERM5H","name":"ankurs-test-app"},"user":{"id":"W2P533DNJ","name":"aoberoi","team_id":"T33J49SAG"},"action_ts":"1551426383.556633","message_ts":"1551426353.000100","attachment_id":"1","token":"FkUFnKpO1ugIMmKQeE5nwaj6","is_app_unfurl":false,"original_message":{"type":"message","subtype":"bot_message","text":"Would you like to play a game?","ts":"1551426353.000100","username":"Ankur's Test App","bot_id":"BGMA1MTMM","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose a game","text":"Choose a game to play","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"game","text":"Chess","type":"button","value":"chess","style":""},{"id":"2","name":"game","text":"Falken's Maze","type":"button","value":"maze","style":""},{"id":"3","name":"game","text":"Thermonuclear War","type":"button","value":"war","style":"danger","confirm":{"text":"Wouldn't you prefer a good game of chess?","title":"Are you sure?","ok_text":"Yes","dismiss_text":"No"}}]}]},"response_url":"https:\/\/hooks.slack.com\/actions\/T33J49SAG\/565456540647\/egYsRvSkvnMn09FAUaQJ5tAd","trigger_id":"564712614437.105616332356.d6d146f0de047ff41bc943a556010091"}

example from enterprise of menu selection
{"type":"interactive_message","actions":[{"name":"games_list","type":"select","selected_options":[{"value":"checkers"}]}],"callback_id":"wopr_game","team":{"id":"T33J49SAG","domain":"acme-demo-ebc","enterprise_id":"E2FBKA8E7","enterprise_name":"Acme Org"},"channel":{"id":"CGL4ERM5H","name":"ankurs-test-app"},"user":{"id":"W2P533DNJ","name":"aoberoi","team_id":"T33J49SAG"},"action_ts":"1551430021.695327","message_ts":"1551429998.000200","attachment_id":"1","token":"FkUFnKpO1ugIMmKQeE5nwaj6","is_app_unfurl":false,"original_message":{"type":"message","subtype":"bot_message","text":"Would you like to play a game?","ts":"1551429998.000200","username":"Ankur's Test App","bot_id":"BGMA1MTMM","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose a game","text":"Choose a game to play","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"games_list","text":"Pick a game...","type":"select","data_source":"static","options":[{"text":"Hearts","value":"hearts"},{"text":"Bridge","value":"bridge"},{"text":"Checkers","value":"checkers"},{"text":"Chess","value":"chess"},{"text":"Poker","value":"poker"},{"text":"Falken's Maze","value":"maze"},{"text":"Global Thermonuclear War","value":"war"}]}]}]},"response_url":"https:\/\/hooks.slack.com\/actions\/T33J49SAG\/563677485664\/R4w0CnEWBlg73ZrVGqgew2fl","trigger_id":"564303549395.105616332356.8de9f034b2105eb983face2c7b23b7c1"}
*/
export interface InteractiveMessage<Action extends InteractiveAction> {
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

export interface DialogSubmitAction {
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

/*
example from enterprise:
{"type":"message_action","token":"FkUFnKpO1ugIMmKQeE5nwaj6","action_ts":"1551430477.883876","team":{"id":"T33J49SAG","domain":"acme-demo-ebc","enterprise_id":"E2FBKA8E7","enterprise_name":"Acme Org"},"user":{"id":"W2P533DNJ","name":"aoberoi","team_id":"T33J49SAG"},"channel":{"id":"CGL4ERM5H","name":"ankurs-test-app"},"callback_id":"my_callback_id","trigger_id":"564387543060.105616332356.bc784a7cd02a22efffb2e1552815152d","message_ts":"1551411278.000700","message":{"client_msg_id":"8610840a-a014-4be2-8ff4-7d97dcc94ae0","type":"message","text":"hello","user":"W2P533DNJ","ts":"1551411278.000700"},"response_url":"https:\/\/hooks.slack.com\/app\/T33J49SAG\/564387543108\/Xl91WUMf828cZTfCCiozdm0d"}
{"type":"message_action","token":"FkUFnKpO1ugIMmKQeE5nwaj6","action_ts":"1551430750.219244","team":{"id":"T33J49SAG","domain":"acme-demo-ebc","enterprise_id":"E2FBKA8E7","enterprise_name":"Acme Org"},"user":{"id":"W2P533DNJ","name":"aoberoi","team_id":"T33J49SAG"},"channel":{"id":"CGL4ERM5H","name":"ankurs-test-app"},"callback_id":"my_callback_id","trigger_id":"564434712642.105616332356.1b2b0f08ebea351c601de2f1c65afd2e","message_ts":"1551429998.000200","message":{"type":"message","subtype":"bot_message","text":"Would you like to play a game?","ts":"1551429998.000200","username":"Ankur's Test App","bot_id":"BGMA1MTMM","attachments":[{"callback_id":"wopr_game","fallback":"You are unable to choose a game","text":"Choose a game to play","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"games_list","text":"Pick a game...","type":"select","data_source":"static","options":[{"text":"Hearts","value":"hearts"},{"text":"Bridge","value":"bridge"},{"text":"Checkers","value":"checkers"},{"text":"Chess","value":"chess"},{"text":"Poker","value":"poker"},{"text":"Falken's Maze","value":"maze"},{"text":"Global Thermonuclear War","value":"war"}]}]}]},"response_url":"https:\/\/hooks.slack.com\/app\/T33J49SAG\/564390690388\/J2YmZSiNKPsFpX4tVZ41q73Z"}
*/
export interface MessageAction {
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

/*
example from enterprise:
{"name":"neighborhood","value":"bern","callback_id":"pick_sf_neighborhood","type":"interactive_message","team":{"id":"T33J49SAG","domain":"acme-demo-ebc","enterprise_id":"E2FBKA8E7","enterprise_name":"Acme Org"},"channel":{"id":"CGL4ERM5H","name":"ankurs-test-app"},"user":{"id":"W2P533DNJ","name":"aoberoi","team_id":"T33J49SAG"},"action_ts":"1551433156.885757","message_ts":"1551433013.001100","attachment_id":"1","token":"FkUFnKpO1ugIMmKQeE5nwaj6"}
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
    },
    action_ts: string;
    message_ts?: string; // not when within a dialog
    attachment_id?: string; // not when within a dialog
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

export interface Context {
  [key: string]: any;
}

export interface Middleware<Args extends AnyMiddlewareArgs> {
  // TODO: is there something nice we can do to get context's property types to flow from one middleware to the next?
  (args: Args & { next: NextMiddleware, context: Context }): void;
}

export interface NextMiddleware {
  (error: Error): void;
  (postProcess: PostProcessFn): void;
  (): void;
}

// TODO: should this any be unknown type?
export interface PostProcessFn {
  (error: Error | undefined, done: (error?: Error) => void): any;
}
