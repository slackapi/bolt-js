import { PlainTextElement, Confirmation, Option } from '@slack/types';
import { StringIndexed } from '../helpers';
import { ViewOutput, ViewStateValue } from '../view';

/**
 * All known actions from in Slack's interactive elements
 *
 * This is a discriminated union. The discriminant is the `type` property.
 */
export type BlockElementAction =
  | ButtonAction
  | UsersSelectAction
  | MultiUsersSelectAction
  | StaticSelectAction
  | MultiStaticSelectAction
  | ConversationsSelectAction
  | MultiConversationsSelectAction
  | ChannelsSelectAction
  | MultiChannelsSelectAction
  | ExternalSelectAction
  | MultiExternalSelectAction
  | OverflowAction
  | DatepickerAction
  | RadioButtonsAction
  | CheckboxesAction
  | PlainTextInputAction;

/**
 * Any action from Slack's interactive elements
 *
 * This type is used to represent actions that aren't known ahead of time. Each of the known element actions also
 * implement this interface.
 */
export interface BasicElementAction<T extends string = string> {
  type: T;
  block_id: string;
  action_id: string;
  action_ts: string;
}

/**
 * An action from a button element
 */
export interface ButtonAction extends BasicElementAction<'button'> {
  value: string;
  text: PlainTextElement;
  url?: string;
  confirm?: Confirmation;
}

/**
 * An action from a select menu with static options
 */
export interface StaticSelectAction extends BasicElementAction<'static_select'> {
  selected_option: {
    text: PlainTextElement;
    value: string;
  };
  initial_option?: Option;
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a multi select menu with static options
 */
export interface MultiStaticSelectAction extends BasicElementAction<'multi_static_select'> {
  selected_options: {
    text: PlainTextElement;
    value: string;
  }[];
  initial_options?: Option[];
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a select menu with user list
 */
export interface UsersSelectAction extends BasicElementAction<'users_select'> {
  selected_user: string;
  initial_user?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a multi select menu with user list
 */
export interface MultiUsersSelectAction extends BasicElementAction<'multi_users_select'> {
  selected_users: string[];
  initial_users?: string[];
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a select menu with conversations list
 */
export interface ConversationsSelectAction extends BasicElementAction<'conversations_select'> {
  selected_conversation: string;
  initial_conversation?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a multi select menu with conversations list
 */
export interface MultiConversationsSelectAction extends BasicElementAction<'multi_conversations_select'> {
  selected_conversations: string[];
  initial_conversations?: string[];
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a select menu with channels list
 */
export interface ChannelsSelectAction extends BasicElementAction<'channels_select'> {
  selected_channel: string;
  initial_channel?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a multi select menu with channels list
 */
export interface MultiChannelsSelectAction extends BasicElementAction<'multi_channels_select'> {
  selected_channels: string[];
  initial_channels?: string[];
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a select menu with external data source
 */
export interface ExternalSelectAction extends BasicElementAction<'external_select'> {
  selected_option?: Option;
  initial_option?: Option;
  placeholder?: PlainTextElement;
  min_query_length?: number;
  confirm?: Confirmation;
}

/**
 * An action from a multi select menu with external data source
 */
export interface MultiExternalSelectAction extends BasicElementAction<'multi_external_select'> {
  selected_options?: Option[];
  initial_options?: Option[];
  placeholder?: PlainTextElement;
  min_query_length?: number;
  confirm?: Confirmation;
}

/**
 * An action from an overflow menu element
 */
export interface OverflowAction extends BasicElementAction<'overflow'> {
  selected_option: {
    text: PlainTextElement;
    value: string;
  };
  confirm?: Confirmation;
}

/**
 * An action from a date picker element
 */
export interface DatepickerAction extends BasicElementAction<'datepicker'> {
  selected_date: string | null;
  initial_date?: string;
  placeholder?: PlainTextElement;
  confirm?: Confirmation;
}

/**
 * An action from a radio button element
 */
export interface RadioButtonsAction extends BasicElementAction<'radio_buttons'> {
  selected_option: Option | null;
  initial_option?: Option;
  confirm?: Confirmation;
}

/**
 * An action from a checkboxes element
 */
export interface CheckboxesAction extends BasicElementAction<'checkboxes'> {
  selected_options: Option[];
  initial_options?: Option[];
  confirm?: Confirmation;
}

/**
 *  An action from a plain_text_input element (must use dispatch_action: true)
 */
export interface PlainTextInputAction extends BasicElementAction<'plain_text_input'> {
  value: string;
}

/**
 * A Slack Block Kit element action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack's Block Kit interactive components.
 */
export interface BlockAction<ElementAction extends BasicElementAction = BlockElementAction> {
  type: 'block_actions';
  actions: ElementAction[];
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
  channel?: {
    id: string;
    name: string;
  };
  message?: {
    type: 'message';
    user?: string; // undocumented that this is optional, it won't be there for bot messages
    ts: string;
    text?: string; // undocumented that this is optional, but how could it exist on block kit based messages?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  view?: ViewOutput;
  state?: {
    values: {
      [blockId: string]: {
        [actionId: string]: ViewStateValue;
      };
    };
  };
  token: string;
  response_url: string;
  trigger_id: string;
  api_app_id: string;

  // TODO: we'll need to fill this out a little more carefully in the future, possibly using a generic parameter
  container: StringIndexed;

  // this appears in the block_suggestions schema, but we're not sure when its present or what its type would be
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app_unfurl?: any;

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
export type BlockButtonAction = BlockAction<ButtonAction>;
export type BlockStaticSelectAction = BlockAction<StaticSelectAction>;
export type BlockUsersSelectAction = BlockAction<UsersSelectAction>;
export type BlockConversationsSelectAction = BlockAction<ConversationsSelectAction>;
export type BlockChannelsSelectAction = BlockAction<ChannelsSelectAction>;
export type BlockExternalSelectAction = BlockAction<ExternalSelectAction>;
export type BlockOverflowAction = BlockAction<OverflowAction>;
export type BlockDatepickerAction = BlockAction<DatepickerAction>;
export type BlockRadioButtonsAction = BlockAction<RadioButtonsAction>;
export type BlockCheckboxesAction = BlockAction<CheckboxesAction>;
export type BlockPlainTextInputAction = BlockAction<PlainTextInputAction>;
