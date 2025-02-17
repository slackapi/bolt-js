import type { Confirmation, Option, PlainTextElement, RichTextBlock } from '@slack/types';
import type { FunctionInputs } from '../events';
import type { StringIndexed } from '../utilities';
import type { ViewOutput, ViewStateValue } from '../view';

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
  | TimepickerAction
  | RadioButtonsAction
  | CheckboxesAction
  | PlainTextInputAction
  | RichTextInputAction;

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
  value?: string;
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
 * An action from a time picker element
 */
export interface TimepickerAction extends BasicElementAction<'timepicker'> {
  selected_time: string | null;
  initial_time?: string;
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
 * An action from a plain_text_input element (must use dispatch_action: true)
 */
export interface PlainTextInputAction extends BasicElementAction<'plain_text_input'> {
  value: string;
}

/**
 * An action from a rich_text_input element (must use dispatch_action: true)
 */
export interface RichTextInputAction extends BasicElementAction<'rich_text_input'> {
  rich_text_value: RichTextBlock;
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
    /**
     * name will be present if the block_action originates from the Home tab
     */
    name?: string;
    username: string;
    team_id?: string;
  };
  channel?: {
    id: string;
    name: string;
  };
  // TODO: breaking change: this should not be optional, but should be conditionally tacked on based on the specific block_action subtype
  message?: {
    type: 'message';
    user?: string; // undocumented that this is optional, it won't be there for bot messages
    ts: string;
    text?: string; // undocumented that this is optional, but how could it exist on block kit based messages?
    // biome-ignore lint/suspicious/noExplicitAny: TODO: poorly typed message here
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

  // biome-ignore lint/suspicious/noExplicitAny: TODO: this appears in the block_suggestions schema, but we're not sure when its present or what its type would be
  app_unfurl?: any;

  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };

  // function scoped properties
  bot_access_token?: string;
  function_data?: {
    execution_id: string;
    function: {
      callback_id: string;
    };
    inputs: FunctionInputs;
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
export type BlockTimepickerAction = BlockAction<TimepickerAction>;
export type BlockRadioButtonsAction = BlockAction<RadioButtonsAction>;
export type BlockCheckboxesAction = BlockAction<CheckboxesAction>;
export type BlockPlainTextInputAction = BlockAction<PlainTextInputAction>;
