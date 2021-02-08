import { MessageAttachment, KnownBlock, Block } from '@slack/types';

export type MessageEvent =
  | GenericMessageEvent
  | BotMessageEvent
  | EKMAccessDeniedMessageEvent
  | MeMessageEvent
  | MessageChangedEvent
  | MessageDeletedEvent
  | MessageRepliedEvent
  | ThreadBroadcastMessageEvent;

export interface GenericMessageEvent {
  type: 'message';
  subtype: undefined;
  event_ts: string;
  team: string;
  channel: string;
  user: string;
  text?: string;
  ts: string;
  thread_ts?: string;
  channel_type: channelTypes;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  files?: File[];
  edited?: {
    user: string;
    ts: string;
  };
  client_msg_id?: string;
  parent_user_id?: string;

  // TODO: optional types that maybe should flow into other subtypes?
  is_starred?: boolean;
  pinned_to?: string[];
  reactions?: {
    name: string;
    count: number;
    users: string[];
  }[];
}

export interface BotMessageEvent {
  type: 'message';
  subtype: 'bot_message';
  event_ts: string;
  channel: string;
  channel_type: channelTypes;
  ts: string;
  text: string;
  bot_id: string;
  username?: string;
  icons?: {
    [size: string]: string;
  };

  // copied from MessageEvent
  // TODO: is a user really optional? likely for things like IncomingWebhook authored messages
  user?: string;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  edited?: {
    user: string;
    ts: string;
  };
  thread_ts?: string;
}

export interface EKMAccessDeniedMessageEvent {
  type: 'message';
  subtype: 'ekm_access_denied';
  event_ts: string;
  channel: string;
  channel_type: channelTypes;
  ts: string;
  text: string; // This will not have any meaningful content within
  user: 'UREVOKEDU';
}

export interface MeMessageEvent {
  type: 'message';
  subtype: 'me_message';
  event_ts: string;
  channel: string;
  channel_type: channelTypes;
  user: string;
  text: string;
  ts: string;
}

export interface MessageChangedEvent {
  type: 'message';
  subtype: 'message_changed';
  event_ts: string;
  hidden: true;
  channel: string;
  channel_type: channelTypes;
  ts: string;
  message: MessageEvent;
  previous_message: MessageEvent;
}

export interface MessageDeletedEvent {
  type: 'message';
  subtype: 'message_deleted';
  event_ts: string;
  hidden: true;
  channel: string;
  channel_type: channelTypes;
  ts: string;
  deleted_ts: string;
  previous_message: MessageEvent;
}

export interface MessageRepliedEvent {
  type: 'message';
  subtype: 'message_replied';
  event_ts: string;
  hidden: true;
  channel: string;
  channel_type: channelTypes;
  ts: string;
  message: MessageEvent & {
    // TODO: should this be the union of all message events with type 'message'?
    thread_ts: string;
    reply_count: number;
    replies: MessageEvent[]; // TODO: should this be the union of all message events with type 'message'?
  };
}

// the `reply_broadcast` message subtype is omitted because it is discontinued

export interface ThreadBroadcastMessageEvent {
  type: 'message';
  subtype: 'thread_broadcast';
  event_ts: string;
  text: string;
  blocks?: (KnownBlock | Block)[];
  user: string;
  ts: string;
  thread_ts?: string;
  root: (GenericMessageEvent | BotMessageEvent) & {
    thread_ts: string;
    reply_count: number;
    reply_users_count: number;
    latest_reply: string;
    reply_users: string[];
  };
  client_msg_id?: string;
  channel: string;
  channel_type: channelTypes;
}

export type channelTypes = 'channel' | 'group' | 'im' | 'mpim' | 'app_home';

interface File {
  id: string;
  created: number;
  name: string | null;
  title: string | null;
  mimetype: string;
  filetype: string;
  pretty_type: string;
  user?: string;
  editable: boolean;
  size: number;
  mode: 'hosted' | 'external' | 'snippet' | 'post';
  is_external: boolean;
  external_type: string | null;
  is_public: boolean;
  public_url_shared: boolean;
  display_as_bot: boolean;
  username: string | null;

  // Authentication required
  url_private?: string;
  url_private_download?: string;

  // Thumbnails (authentication still required)
  thumb_64?: string;
  thumb_80?: string;
  thumb_160?: string;
  thumb_360?: string;
  thumb_360_w?: number;
  thumb_360_h?: number;
  thumb_360_gif?: string;
  thumb_480?: string;
  thumb_720?: string;
  thumb_960?: string;
  thumb_1024?: string;
  permalink: string;
  permalink_public?: string;
  edit_link?: string;
  image_exif_rotation?: number;
  original_w?: number;
  original_h?: number;
  deanimate_gif?: string;

  // Posts
  preview?: string;
  preview_highlight?: string;
  lines?: string;
  lines_more?: string;
  preview_is_truncated?: boolean;
  has_rich_preview?: boolean;

  shares?: {
    [key: string]: any;
  };
  channels: string[] | null;
  groups: string[] | null;
  users?: string[];
  pinned_to?: string[];
  reactions?: {
    [key: string]: any;
  }[];
  is_starred?: boolean;
  num_stars?: number;

  initial_comment?: string;
  comments_count?: string;
}
