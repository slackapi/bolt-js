/**
 * All actions which Slack delivers from legacy interactive messages. The full body of these actions are represented
 * as [[InteractiveMessage]].
 */
export type InteractiveAction = ButtonClick | MenuSelect;

/**
 * A button click action from a legacy interactive message.
 */
export interface ButtonClick {
  type: 'button';
  name: string;
  value: string;
}

/**
 * A menu selection action from a legacy interactive message.
 */
export interface MenuSelect {
  type: 'select';
  name: string;
  selected_options: {
    value: string;
  }[];
}

/**
 * A Slack legacy interactive message action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack's legacy interactive messages.
 */
export interface InteractiveMessage<Action extends InteractiveAction = InteractiveAction> {
  type: 'interactive_message';
  callback_id: string;
  actions: [Action];
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // undocumented
    enterprise_name?: string; // undocumented
  } | null;
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
  // TODO: confirm optionality of message_ts, if these are always either both available or neither, how can the type
  // system express that?
  message_ts?: string;
  // NOTE: the original_message is not available from ephemeral messages
  original_message?: { [key: string]: string };

  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/*
 * Aliases - these types help make common usages shorter and less intimidating.
 */
export type InteractiveButtonClick = InteractiveMessage<ButtonClick>;
export type InteractiveMenuSelect = InteractiveMessage<MenuSelect>;
