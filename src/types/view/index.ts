import { View, PlainTextElement } from '@slack/types';
import { StringIndexed } from '../helpers';
import { AckFn, RespondFn } from '../utilities';

/**
 * Known view action types
 */
export type SlackViewAction =
  | ViewSubmitAction
  | ViewClosedAction
  | ViewWorkflowStepSubmitAction
  | ViewWorkflowStepClosedAction;
// <ViewAction extends SlackViewAction = ViewSubmitAction>
/**
 * Arguments which listeners and middleware receive to process a view submission event from Slack.
 */
export interface SlackViewMiddlewareArgs<ViewActionType extends SlackViewAction = SlackViewAction> {
  payload: ViewOutput;
  view: this['payload'];
  body: ViewActionType;
  ack: ViewAckFn<ViewActionType>;
  respond: RespondFn;
}

interface PlainTextElementOutput {
  type: 'plain_text';
  text: string;
  emoji?: boolean;
}

/**
 * A Slack view_submission event wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a view_submission event.
 */
export interface ViewSubmitAction {
  type: 'view_submission';
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
  view: ViewOutput;
  api_app_id: string;
  token: string;
  trigger_id: string; // undocumented
  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/**
 * A Slack view_closed event wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a view_closed event.
 */
export interface ViewClosedAction {
  type: 'view_closed';
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
  view: ViewOutput;
  api_app_id: string;
  token: string;
  is_cleared: boolean;
  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/**
 * A Slack view_submission Workflow Step event
 *
 * This describes the additional JSON-encoded body details for a step's view_submission event
 */

export interface ViewWorkflowStepSubmitAction extends ViewSubmitAction {
  trigger_id: string;
  response_urls: [];
  workflow_step: {
    workflow_step_edit_id: string;
    workflow_id: string;
    step_id: string;
  };
}

/**
 * A Slack view_closed Workflow Step event
 *
 * This describes the additional JSON-encoded body details for a step's view_closed event
 */
export interface ViewWorkflowStepClosedAction extends ViewClosedAction {
  workflow_step: {
    workflow_step_edit_id: string;
    workflow_id: string;
    step_id: string;
  };
}

export interface ViewStateSelectedOption {
  text: PlainTextElement;
  value: string;
}

export interface ViewStateValue {
  type: string;
  value?: string | null;
  selected_date?: string | null;
  selected_time?: string | null;
  selected_conversation?: string | null;
  selected_channel?: string | null;
  selected_user?: string | null;
  selected_option?: ViewStateSelectedOption | null;
  selected_conversations?: string[];
  selected_channels?: string[];
  selected_users?: string[];
  selected_options?: ViewStateSelectedOption[];
}

export interface ViewOutput {
  id: string;
  callback_id: string;
  team_id: string;
  app_installed_team_id?: string;
  app_id: string | null;
  bot_id: string;
  title: PlainTextElementOutput;
  type: string;
  blocks: StringIndexed; // TODO: should this just be any?
  close: PlainTextElementOutput | null;
  submit: PlainTextElementOutput | null;
  state: {
    values: {
      [blockId: string]: {
        [actionId: string]: ViewStateValue;
      };
    };
  };
  hash: string;
  private_metadata: string;
  root_view_id: string | null;
  previous_view_id: string | null;
  clear_on_close: boolean;
  notify_on_close: boolean;
  external_id?: string;
}

export interface ViewUpdateResponseAction {
  response_action: 'update';
  view: View;
}

export interface ViewPushResponseAction {
  response_action: 'push';
  view: View;
}

export interface ViewClearResponseAction {
  response_action: 'clear';
}

export interface ViewErrorsResponseAction {
  response_action: 'errors';
  errors: {
    [blockId: string]: string;
  };
}

export type ViewResponseAction =
  | ViewUpdateResponseAction
  | ViewPushResponseAction
  | ViewClearResponseAction
  | ViewErrorsResponseAction;

/**
 * Type function which given a view action `VA` returns a corresponding type for the `ack()` function. The function is
 * used to acknowledge the receipt (and possibly signal failure) of an view submission or closure from a listener or
 * middleware.
 */
type ViewAckFn<VA extends SlackViewAction = SlackViewAction> = VA extends ViewSubmitAction
  ? AckFn<ViewResponseAction> // ViewClosedActions can only be acknowledged, there are no arguments
  : AckFn<void>;
