import { Block, KnownBlock, PlainTextElement, RichTextBlock, View } from '@slack/types';
import { AckFn, RespondFn } from '../utilities';

/**
 * Known view action types
 */
export type SlackViewAction =
  | ViewSubmitAction
  | ViewClosedAction
  | ViewWorkflowStepSubmitAction // TODO: remove workflow step stuff in bolt v5
  | ViewWorkflowStepClosedAction;
// <ViewAction extends SlackViewAction = ViewSubmitAction>
/**
 * Arguments which listeners and middleware receive to process a view submission event from Slack.
 */
export interface SlackViewMiddlewareArgs<ViewActionType extends SlackViewAction = SlackViewAction> {
  payload: ViewOutput;
  view: this['payload'];
  body: ViewActionType;
  ack: ViewAckFn<ViewActionType>;
  respond: RespondFn;
}

// TODO: @slack/types probably has something very close to this
interface PlainTextElementOutput {
  type: 'plain_text';
  text: string;
  emoji?: boolean;
}

export interface ViewResponseUrl {
  block_id: string;
  action_id: string;
  channel_id: string;
  response_url: string;
}

// TODO: "Action" naming here is confusing. this is a view submisson event. already exists in @slack/types
/**
 * A Slack view_submission event wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a view_submission event.
 */
export interface ViewSubmitAction {
  type: 'view_submission';
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
  view: ViewOutput;
  api_app_id: string;
  token: string;
  trigger_id: string; // undocumented
  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
  response_urls?: ViewResponseUrl[];
}

/**
 * A Slack view_closed event wrapped in the standard metadata.
 *
 * This describes the entire JSON-encoded body of a view_closed event.
 */
export interface ViewClosedAction {
  type: 'view_closed';
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
  view: ViewOutput;
  api_app_id: string;
  token: string;
  is_cleared: boolean;
  // exists for enterprise installs
  is_enterprise_install?: boolean;
  enterprise?: {
    id: string;
    name: string;
  };
}

/**
 * A Slack view_submission step from app event
 *
 * This describes the additional JSON-encoded body details for a step's view_submission event
 * @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface ViewWorkflowStepSubmitAction extends ViewSubmitAction {
  trigger_id: string;
  response_urls?: ViewResponseUrl[];
  workflow_step: {
    workflow_step_edit_id: string;
    workflow_id: string;
    step_id: string;
  };
}

/**
 * A Slack view_closed step from app event
 *
 * This describes the additional JSON-encoded body details for a step's view_closed event
 * @deprecated Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
 * version.
 */
export interface ViewWorkflowStepClosedAction extends ViewClosedAction {
  workflow_step: {
    workflow_step_edit_id: string;
    workflow_id: string;
    step_id: string;
  };
}

export interface ViewStateSelectedOption {
  text: PlainTextElement;
  value: string;
}

// TODO: this should probably exist in @slack/types
export interface UploadedFile {
  id: string;
  created: number;
  timestamp: number;
  name: string;
  title: string;
  filetype: string;
  mimetype: string;
  permalink: string;
  url_private: string;
  url_private_download: string;
  user: string;
  user_team: string;
  username?: string;
  access?: string;
  alt_txt?: string;
  app_id?: string;
  app_name?: string;
  bot_id?: string;
  channel_actions_count?: number;
  channel_actions_ts?: string;
  channels?: string[];
  comments_count?: number;
  converted_pdf?: string;
  deanimate?: string;
  deanimate_gif?: string;
  display_as_bot?: boolean;
  duration_ms?: number;
  edit_link?: string;
  editable?: boolean;
  editor?: string;
  external_id?: string;
  external_type?: string;
  external_url?: string;
  file_access?: string;
  groups?: string[];
  has_more?: boolean;
  has_more_shares?: boolean;
  has_rich_preview?: boolean;
  hls?: string;
  hls_embed?: string;
  image_exif_rotation?: number;
  ims?: string[];
  is_channel_space?: boolean;
  is_external?: boolean;
  is_public?: boolean;
  is_starred?: boolean;
  last_editor?: string;
  last_read?: number;
  lines?: number;
  lines_more?: number;
  linked_channel_id?: string;
  media_display_type?: string;
  mode?: string;
  mp4?: string;
  mp4_low?: string;
  non_owner_editable?: boolean;
  num_stars?: number;
  org_or_workspace_access?: string;
  original_attachment_count?: number;
  original_h?: string;
  original_w?: string;
  permalink_public?: string;
  pinned_to?: string[];
  pjpeg?: string;
  plain_text?: string;
  pretty_type?: string;
  preview?: string;
  preview_highlight?: string;
  preview_is_truncated?: boolean;
  preview_plain_text?: string;
  private_channels_with_file_access_count?: number;
  public_url_shared?: boolean;
  simplified_html?: string;
  size?: number;
  source_team?: string;
  subject?: string;
  subtype?: string;
  thumb_1024?: string;
  thumb_1024_gif?: string;
  thumb_1024_h?: string;
  thumb_1024_w?: string;
  thumb_160?: string;
  thumb_160_gif?: string;
  thumb_160_h?: string;
  thumb_160_w?: string;
  thumb_360?: string;
  thumb_360_gif?: string;
  thumb_360_h?: string;
  thumb_360_w?: string;
  thumb_480?: string;
  thumb_480_gif?: string;
  thumb_480_h?: string;
  thumb_480_w?: string;
  thumb_64?: string;
  thumb_64_gif?: string;
  thumb_64_h?: string;
  thumb_64_w?: string;
  thumb_720?: string;
  thumb_720_gif?: string;
  thumb_720_h?: string;
  thumb_720_w?: string;
  thumb_80?: string;
  thumb_800?: string;
  thumb_800_gif?: string;
  thumb_800_h?: string;
  thumb_800_w?: string;
  thumb_80_gif?: string;
  thumb_80_h?: string;
  thumb_80_w?: string;
  thumb_960?: string;
  thumb_960_gif?: string;
  thumb_960_h?: string;
  thumb_960_w?: string;
  thumb_gif?: string;
  thumb_pdf?: string;
  thumb_pdf_h?: string;
  thumb_pdf_w?: string;
  thumb_tiny?: string;
  thumb_video?: string;
  thumb_video_h?: number;
  thumb_video_w?: number;
  updated?: number;
  url_static_preview?: string;
  vtt?: string;
}

export interface ViewStateValue {
  type: string;
  value?: string | null;
  selected_date?: string | null;
  selected_time?: string | null;
  selected_date_time?: number | null; // UNIX timestamp value
  selected_conversation?: string | null;
  selected_channel?: string | null;
  selected_user?: string | null;
  selected_option?: ViewStateSelectedOption | null;
  selected_conversations?: string[];
  selected_channels?: string[];
  selected_users?: string[];
  selected_options?: ViewStateSelectedOption[];
  rich_text_value?: RichTextBlock;
  files?: UploadedFile[]; // type: "file_input"
}

export interface ViewOutput {
  id: string;
  callback_id: string;
  team_id: string;
  app_installed_team_id?: string;
  app_id: string | null;
  bot_id: string;
  title: PlainTextElementOutput;
  type: string;
  blocks: (KnownBlock | Block)[];
  close: PlainTextElementOutput | null;
  submit: PlainTextElementOutput | null;
  state: {
    values: {
      [blockId: string]: {
        [actionId: string]: ViewStateValue;
      };
    };
  };
  hash: string;
  private_metadata: string;
  root_view_id: string | null;
  previous_view_id: string | null;
  clear_on_close: boolean;
  notify_on_close: boolean;
  external_id?: string;
}

export interface ViewUpdateResponseAction {
  response_action: 'update';
  view: View;
}

export interface ViewPushResponseAction {
  response_action: 'push';
  view: View;
}

export interface ViewClearResponseAction {
  response_action: 'clear';
}

export interface ViewErrorsResponseAction {
  response_action: 'errors';
  errors: {
    [blockId: string]: string;
  };
}

export type ViewResponseAction =
  | ViewUpdateResponseAction
  | ViewPushResponseAction
  | ViewClearResponseAction
  | ViewErrorsResponseAction;

/**
 * Type function which given a view action `VA` returns a corresponding type for the `ack()` function. The function is
 * used to acknowledge the receipt (and possibly signal failure) of a view submission or closure from a listener or
 * middleware.
 */
type ViewAckFn<VA extends SlackViewAction = SlackViewAction> = VA extends ViewSubmitAction
  ? AckFn<ViewResponseAction> // ViewClosedActions can only be acknowledged, there are no arguments
  : AckFn<void>;
