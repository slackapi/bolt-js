/**
 * A Slack dialog submit action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack dialogs.
 */
export interface DialogSubmitAction {
  type: 'dialog_submission';
  callback_id: string;
  submission: { [name: string]: string };
  state: string;
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
  channel: {
    id: string;
    name: string;
  };
  action_ts: string;
  token: string;
  response_url: string;

  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/**
 * A Slack dialog submission validation response. Use an object of this type to describe errors regarding inputs that
 * were part of the submission.
 */
export interface DialogValidation {
  errors: {
    name: string;
    error: string;
  }[];
}
