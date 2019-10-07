import { StringIndexed } from '../helpers';
import { RespondArguments, AckFn } from '../utilities';

/**
 * Known view action types
 */
export type SlackViewAction = ViewSubmitAction | ViewClosedAction;
// <ViewAction extends SlackViewAction = ViewSubmitAction>
/**
 * Arguments which listeners and middleware receive to process a view submission event from Slack.
 */
export interface SlackViewMiddlewareArgs<ViewActionType extends SlackViewAction = ViewSubmitAction> {
  payload: ViewOutput;
  view: this['payload'];
  body: ViewActionType;
  ack: AckFn<string | RespondArguments>;
}

interface PlainTextElementOutput {
  type: 'plain_text';
  text: string;
  emoji: boolean;
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
  };
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  view: ViewOutput;
  api_app_id: string;
  token: string;
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
  };
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  view: ViewOutput;
  api_app_id: string;
  token: string;
  is_cleared: boolean;
}

export interface ViewOutput {
  id: string;
  callback_id: string;
  team_id: string;
  app_id: string | null;
  bot_id: string;
  title: PlainTextElementOutput;
  type: string;
  blocks: StringIndexed; // TODO: should this just be any?
  close: PlainTextElementOutput | null;
  submit: PlainTextElementOutput | null;
  state: object; // TODO: this should probably be expanded in the future
  hash: string;
  private_metadata: string;
  root_view_id: string | null;
  previous_view_id: string | null;
  clear_on_close: boolean;
  notify_on_close: boolean;
  external_id?: string;
}
