/**
 * A Slack global action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack global actions.
 */
export interface GlobalAction {
  type: 'global_action';
  callback_id: string;
  trigger_id: string;
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
  action_ts: string;
}
