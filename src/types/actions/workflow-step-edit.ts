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
    username: string;
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
    inputs: {
      [key: string]: {
        value: any;
      };
    };
    outputs: {
      name: string;
      type: string;
      label: string;
    }[];
    step_name?: string;
    step_image_url?: string;
  };

  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}
