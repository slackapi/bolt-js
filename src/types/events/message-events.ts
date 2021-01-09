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
  channel: string;
  user: string;
  text?: string;
  ts: string;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  edited?: {
    user: string;
    ts: string;
  };

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
  channel: string;
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
}

export interface EKMAccessDeniedMessageEvent {
  type: 'message';
  subtype: 'ekm_access_denied';
  channel: string;
  ts: string;
  text: string; // This will not have any meaningful content within
  user: 'UREVOKEDU';
}

export interface MeMessageEvent {
  type: 'message';
  subtype: 'me_message';
  channel: string;
  user: string;
  text: string;
  ts: string;
}

export interface MessageChangedEvent {
  type: 'message';
  subtype: 'message_changed';
  hidden: true;
  channel: string;
  ts: string;
  message: MessageEvent;
}

export interface MessageDeletedEvent {
  type: 'message';
  subtype: 'message_deleted';
  hidden: true;
  channel: string;
  ts: string;
  deleted_ts: string;
}

export interface MessageRepliedEvent {
  type: 'message';
  subtype: 'message_replied';
  hidden: true;
  channel: string;
  event_ts: string;
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
  subtype: undefined;
  channel: string;
  message: {
    type: 'message';
    subtype: 'thread_broadcast';
    thread_ts: string;
    user: string;
    ts: string;
    root: (GenericMessageEvent | BotMessageEvent) & {
      thread_ts: string;
      reply_count: number;
      replies: { user: string; ts: string }[];
      // TODO: unread_count doesn't appear in any other message event types, is this really the only place its included?
      unread_count?: number;
    };
  };
}
