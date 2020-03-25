/**
 * A Slack message action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack message actions.
 */
export interface MessageShortcut {
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
