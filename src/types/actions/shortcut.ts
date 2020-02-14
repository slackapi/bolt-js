/**
 * A Slack global action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack global actions.
 */
export interface Shortcut {
  type: 'shortcut';
  callback_id: string;
  trigger_id: string;
  user: {
    id: string;
    name: string;
  };
  // remove this once we move to shortcut method
  // needed because of line 54 in helpers.ts
  channel?: undefined;
  team: {
    id: string;
    domain: string;
    // remove this once we move to shortcut
    // needed because of line 540 in App.ts
    enterprise_id?: string;
  };
  token: string;
  action_ts: string;
}
