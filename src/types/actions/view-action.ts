/**
 * A Slack view submit action wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a request from Slack views (modals).
 */

interface PlainTextElementOutput {
  type: 'plain_text';
  text: string;
  emoji: boolean;
}

export interface ViewSubmitAction {
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
    // callback_id: string;
    team_id: string;
    app_id: string | null;
    bot_id: string;
    title: PlainTextElementOutput;
    type: string;
    blocks: any[];
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
