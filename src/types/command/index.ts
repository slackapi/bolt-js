import { StringIndexed } from '../helpers';
import { SayFn, RespondFn, RespondArguments, AckFn, ReactFn } from '../utilities';

/**
 * Arguments which listeners and middleware receive to process a slash command from Slack.
 */
export interface SlackCommandMiddlewareArgs {
  payload: SlashCommand;
  command: this['payload'];
  body: this['payload'];
  say: SayFn;
  respond: RespondFn;
  react: ReactFn;
  ack: AckFn<string | RespondArguments>;
}

/**
 * A Slack slash command
 *
 * This describes the entire URL-encoded body of a request from Slack's slash commands.
 */
export interface SlashCommand extends StringIndexed {
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
