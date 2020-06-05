/**
 * A Slack workflow step action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack workflow step actions.
 */
export interface WorkflowStepEdit {
  type: 'workflow_step_edit';
  callback_id: string;
  trigger_id: string;
  user: {
    id: string;
    name: string;
    team_id?: string; // undocumented
  };
  team: {
    id: string;
    domain: string;
    enterprise_id?: string; // undocumented
    enterprise_name?: string; // undocumented
  };
  channel?: {
    id?: string;
    name?: string;
  };
  token: string;
  action_ts: string; // undocumented
  workflow_step: {
    workflow_id: string;
    step_id: string;
  };
}
