import { StringIndexed } from '../helpers';
import { SayFn, RespondArguments, AckFn } from '../utilities';

/**
 * Arguments which listeners and middleware receive to process a view submission event from Slack.
 */
export interface SlackViewMiddlewareArgs {
  payload: ViewSubmit;
  view: this['payload'];
  body: this['payload'];
  say: SayFn;
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
 * This describes the entire JSON-encoded body of a request from Slack's slash commands.
 */
export interface ViewSubmit extends StringIndexed {
  type: 'view_submission';
  callback_id: string;
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
  view: {
    id: string;
    // callback_id: string; // TODO
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
  };
  api_app_id: string;
  token: string;
}
