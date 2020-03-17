/**
 * A Slack global shortcut wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack global shortcuts.
 */
export interface GlobalShortcut {
  type: 'shortcut';
  callback_id: string;
  trigger_id: string;
  user: {
    id: string;
    username: string;
    team_id: string;
  };
  team: {
    id: string;
    domain: string;
    enterprise_id?: string;
    enterprise_name?: string;
  };
  token: string;
  action_ts: string;
}
