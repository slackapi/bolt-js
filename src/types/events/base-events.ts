import { StringIndexed } from '../helpers';
import { MessageAttachment, KnownBlock, Block, View } from '@slack/types';

/**
 * All known event types in Slack's Events API
 *
 * This is a discriminated union. The discriminant is the `type` property.
 */
export type SlackEvent =
  | AppRequestedEvent
  | AppHomeOpenedEvent
  | AppMentionEvent
  | AppUninstalledEvent
  | ChannelArchiveEvent
  | ChannelCreatedEvent
  | ChannelDeletedEvent
  | ChannelHistoryChangedEvent
  | ChannelLeftEvent
  | ChannelRenameEvent
  | ChannelSharedEvent
  | ChannelUnarchiveEvent
  | ChannelUnsharedEvent
  | DNDUpdatedEvent
  | DNDUpdatedUserEvent
  | EmailDomainChangedEvent
  | EmojiChangedEvent
  | FileChangeEvent
  | FileCommentDeletedEvent
  | FileCreatedEvent
  | FileDeletedEvent
  | FilePublicEvent
  | FileSharedEvent
  | FileUnsharedEvent
  | GridMigrationFinishedEvent
  | GridMigrationStartedEvent
  | GroupArchiveEvent
  | GroupCloseEvent
  | GroupDeletedEvent
  | GroupHistoryChangedEvent
  | GroupLeftEvent
  | GroupOpenEvent
  | GroupRenameEvent
  | GroupUnarchiveEvent
  | IMCloseEvent
  | IMCreatedEvent
  | IMHistoryChangedEvent
  | IMOpenEvent
  | LinkSharedEvent
  | MemberJoinedChannelEvent
  | MemberLeftChannelEvent
  | MessageEvent
  | PinAddedEvent
  | PinRemovedEvent
  | ReactionAddedEvent
  | ReactionRemovedEvent
  | StarAddedEvent
  | StarRemovedEvent
  | SubteamCreated
  | SubteamMembersChanged
  | SubteamSelfAddedEvent
  | SubteamSelfRemovedEvent
  | SubteamUpdatedEvent
  | TeamDomainChangedEvent
  | TeamJoinEvent
  | TeamRenameEvent
  | TokensRevokedEvent
  | UserChangeEvent;

/**
 * Any event in Slack's Events API
 *
 * This type is used to represent events that aren't known ahead of time. Each of the known event types also implement
 * this interface. That condition isn't enforced, since we're not interested in factoring out common properties from the
 * known event types.
 */
export interface BasicSlackEvent<Type extends string = string> extends StringIndexed {
  type: Type;
}

/* ------- TODO: Generate these interfaces ------- */

// TODO: why are these all StringIndexed? who does that really help when going more than one level deep means you have
// to start coercing types anyway?

export interface AppRequestedEvent extends StringIndexed {
  type: 'app_requested';
  app_request: {
    id: string;
    app: {
      id: string;
      name: string;
      description: string;
      help_url: string;
      privacy_policy_url: string;
      app_homepage_url: string;
      app_directory_url: string;
      is_app_directory_approved: boolean;
      is_internal: boolean;
      additional_info: string;
    };
  };
  previous_resolution: {
    status: 'approved' | 'restricted';
    scopes: {
      name: string;
      description: string;
      is_dangerous: boolean;
      token_type: 'bot' | 'user' | 'app' | null;
    };
  } | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  team: {
    id: string;
    name: string;
    domain: string;
  };
  scopes: {
    name: string;
    description: string;
    is_dangerous: boolean;
    token_type: 'bot' | 'user' | 'app' | null;
  };
  message: string;
  date_created: number;
}

export interface AppHomeOpenedEvent extends StringIndexed {
  type: 'app_home_opened';
  user: string;
  channel: string;
  tab?: 'home' | 'messages';
  view?: View;
  event_ts: string;
}

// NOTE: this is essentially the same as the `message` event, except for the type and that this uses `event_ts` instead
// of `ts`
export interface AppMentionEvent extends StringIndexed {
  type: 'app_mention';
  user: string;
  text: string;
  ts: string;
  channel: string;
  event_ts: string;
}

// TODO: this event doesn't use the envelope. write test cases to make sure its works without breaking, and figure out
// what exceptions need to be made to the related types to make this work
// https://api.slack.com/events/app_rate_limited
// export interface AppRateLimitedEvent extends StringIndexed {
// }

export interface AppUninstalledEvent extends StringIndexed {
  type: 'app_uninstalled';
}

export interface ChannelArchiveEvent extends StringIndexed {
  type: 'channel_archive';
  channel: string;
  user: string;
}

export interface ChannelCreatedEvent extends StringIndexed {
  type: 'channel_created';
  channel: {
    id: string;
    name: string;
    created: number;
    creator: string; // user ID
  };
}

export interface ChannelDeletedEvent extends StringIndexed {
  type: 'channel_deleted';
  channel: string;
}

export interface ChannelHistoryChangedEvent extends StringIndexed {
  type: 'channel_history_changed';
  latest: string;
  ts: string;
  event_ts: string;
}

export interface ChannelLeftEvent extends StringIndexed {
  type: 'channel_left';
  channel: string;
}

export interface ChannelRenameEvent extends StringIndexed {
  type: 'channel_rename';
  channel: {
    id: string;
    name: string;
    created: number;
  };
}

export interface ChannelSharedEvent extends StringIndexed {
  type: 'channel_shared';
  connected_team_id: string;
  channel: string;
  event_ts: string;
}

export interface ChannelUnarchiveEvent extends StringIndexed {
  type: 'channel_unarchive';
  channel: string;
  user: string;
}

export interface ChannelUnsharedEvent extends StringIndexed {
  type: 'channel_unshared';
  previously_connected_team_id: string;
  channel: string;
  is_ext_shared: boolean;
  event_ts: string;
}

export interface DNDUpdatedEvent extends StringIndexed {
  type: 'dnd_updated';
  user: string;
  dnd_status: {
    dnd_enabled: boolean;
    next_dnd_start_ts: number;
    next_dnd_end_ts: number;
    snooze_enabled: boolean;
    snooze_endtime: number;
    snooze_remaining: number;
  };
}

export interface DNDUpdatedUserEvent extends StringIndexed {
  type: 'dnd_updated_user';
  user: string;
  dnd_status: {
    dnd_enabled: boolean;
    next_dnd_start_ts: number;
    next_dnd_end_ts: number;
  };
}

export interface EmailDomainChangedEvent extends StringIndexed {
  type: 'email_domain_changed';
  email_domain: string;
  event_ts: string;
}

// NOTE: this should probably be broken into its two subtypes
export interface EmojiChangedEvent extends StringIndexed {
  type: 'emoji_changed';
  subtype: 'add' | 'remove';
  names?: string[]; // only for remove
  name?: string; // only for add
  value?: string; // only for add
  event_ts: string;
}

export interface FileChangeEvent extends StringIndexed {
  type: 'file_change';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

// NOTE: `file_comment_added` and `file_comment_edited` are left out because they are discontinued

export interface FileCommentDeletedEvent extends StringIndexed {
  type: 'file_comment_deleted';
  comment: string; // this is an ID
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileCreatedEvent extends StringIndexed {
  type: 'file_created';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileDeletedEvent extends StringIndexed {
  type: 'file_deleted';
  file_id: string;
  event_ts: string;
}

export interface FilePublicEvent extends StringIndexed {
  type: 'file_public';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileSharedEvent extends StringIndexed {
  type: 'file_shared';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileUnsharedEvent extends StringIndexed {
  type: 'file_unshared';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface GridMigrationFinishedEvent extends StringIndexed {
  type: 'grid_migration_finished';
  enterprise_id: string;
}

export interface GridMigrationStartedEvent extends StringIndexed {
  type: 'grid_migration_started';
  enterprise_id: string;
}

export interface GroupArchiveEvent extends StringIndexed {
  type: 'group_archive';
  channel: string;
}

export interface GroupCloseEvent extends StringIndexed {
  type: 'group_close';
  user: string;
  channel: string;
}

export interface GroupDeletedEvent extends StringIndexed {
  type: 'group_deleted';
  channel: string;
}

export interface GroupHistoryChangedEvent extends StringIndexed {
  type: 'group_history_changed';
  latest: string;
  ts: string;
  event_ts: string;
}

export interface GroupLeftEvent extends StringIndexed {
  type: 'group_left';
  channel: string;
}

export interface GroupOpenEvent extends StringIndexed {
  type: 'group_open';
  user: string;
  channel: string;
}

export interface GroupRenameEvent extends StringIndexed {
  type: 'group_rename';
  channel: {
    id: string;
    name: string;
    created: number;
  };
}

export interface GroupUnarchiveEvent extends StringIndexed {
  type: 'group_unarchive';
  channel: string;
}

export interface IMCloseEvent extends StringIndexed {
  type: 'im_close';
  user: string;
  channel: string;
}

export interface IMCreatedEvent extends StringIndexed {
  type: 'im_created';
  user: string;
  // TODO: incomplete, this should probably be a reference to a IM shape from @slack/types. can it just be a
  // Conversation shape? or should it be a Channel shape?
  // https://api.slack.com/types/im
  channel: {
    id: string;
  };
}

export interface IMHistoryChangedEvent extends StringIndexed {
  type: 'im_history_changed';
  latest: string;
  ts: string;
  event_ts: string;
}

export interface IMOpenEvent extends StringIndexed {
  type: 'im_open';
  user: string;
  channel: string;
}

export interface LinkSharedEvent extends StringIndexed {
  type: 'link_shared';
  channel: string;
  user: string;
  message_ts: string;
  thread_ts?: string;
  links: {
    domain: string;
    url: string;
  }[];
}

export interface MemberJoinedChannelEvent extends StringIndexed {
  type: 'member_joined_channel';
  user: string;
  channel: string;
  channel_type: string;
  team: string;
  inviter?: string;
}

export interface MemberLeftChannelEvent extends StringIndexed {
  type: 'member_left_channel';
  user: string;
  channel: string;
  channel_type: string;
  team: string;
}

// TODO: this is just a draft of the actual message event
export interface MessageEvent extends StringIndexed {
  type: 'message';
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

export interface BotMessageEvent extends StringIndexed {
  type: 'message';
  subtype: 'bot_message';
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

export interface EKMAccessDeniedMessageEvent extends StringIndexed {
  type: 'message';
  subtype: 'ekm_access_denied';
  ts: string;
  text: string; // This will not have any meaningful content within
  user: 'UREVOKEDU';
}

export interface MeMessageEvent extends StringIndexed {
  type: 'message';
  subtype: 'me_message';
  channel: string;
  user: string;
  text: string;
  ts: string;
}

export interface MessageChangedEvent extends StringIndexed {
  type: 'message';
  subtype: 'message_changed';
  hidden: true;
  channel: string;
  ts: string;
  message: MessageEvent; // TODO: should this be the union of all message events with type 'message'?
}

export interface MessageDeletedEvent extends StringIndexed {
  type: 'message';
  subtype: 'message_deleted';
  hidden: true;
  channel: string;
  ts: string;
  deleted_ts: string;
}

export interface MessageRepliedEvent extends StringIndexed {
  type: 'message';
  subtype: 'message_replied';
  hidden: true;
  channel: string;
  event_ts: string;
  ts: string;
  message: MessageEvent & { // TODO: should this be the union of all message events with type 'message'?
    thread_ts: string;
    reply_count: number;
    replies: MessageEvent[]; // TODO: should this be the union of all message events with type 'message'?
  };
}

// the `reply_broadcast` message subtype is omitted because it is discontinued

export interface ThreadBroadcastMessageEvent extends StringIndexed {
  type: 'message';
  message: {
    type: 'message';
    subtype: 'thread_broadcast';
    thread_ts: string;
    user: string;
    ts: string;
    root:  MessageEvent & { // TODO: should this be the union of all message events with type 'message'?
      thread_ts: string;
      reply_count: number;
      replies: MessageEvent[]; // TODO: should this be the union of all message events with type 'message'?
      // TODO: unread_count doesn't appear in any other message event types, is this really the only place its included?
      unread_count?: number;
    };
  };
}

export interface PinAddedEvent extends StringIndexed {
  type: 'pin_added';
  user: string;
  channel_id: string;
  // TODO: incomplete, should be message | file | file comment (deprecated)
  item: {
  };
}

export interface PinRemovedEvent extends StringIndexed {
  type: 'pin_removed';
  user: string;
  channel_id: string;
  // TODO: incomplete, should be message | file | file comment (deprecated)
  item: {
  };
  has_pins: boolean;
  event_ts: string;
}

export interface ReactionAddedEvent extends StringIndexed {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item_user: string;
  // TODO: incomplete, should be message | file | file comment (deprecated)
  // https://api.slack.com/events/reaction_added
  item: {
  };
  event_ts: string;
}

export interface ReactionRemovedEvent extends StringIndexed {
  type: 'reaction_removed';
  user: string;
  reaction: string;
  item_user: string;
  // TODO: incomplete, should be message | file | file comment (deprecated)
  // https://api.slack.com/events/reaction_removed
  item: {
  };
  event_ts: string;
}

// NOTE: `resources_added`, `resources_removed`, `scope_denied`, `scope_granted`, are left out because they are
// deprecated as part of the Workspace Apps Developer Preview

export interface StarAddedEvent extends StringIndexed {
  type: 'star_added';
  user: string;
  // TODO: incomplete, items are of type message | file | file comment (deprecated) | channel | im | group
  // https://api.slack.com/events/star_added, https://api.slack.com/methods/stars.list
  item: {
  };
  event_ts: string;
}

export interface StarRemovedEvent extends StringIndexed {
  type: 'star_removed';
  user: string;
  // TODO: incomplete, items are of type message | file | file comment (deprecated) | channel | im | group
  // https://api.slack.com/events/star_removed, https://api.slack.com/methods/stars.list
  item: {
  };
  event_ts: string;
}

export interface SubteamCreated extends StringIndexed {
  type: 'subteam_created';
  // TODO: incomplete, this should probably be a reference to a Usergroup shape from @slack/types.
  // https://api.slack.com/types/usergroup
  subteam: {
    id: string;
  };
}

export interface SubteamMembersChanged extends StringIndexed {
  type: 'subteam_members_changed';
  subteam_id: string;
  team_id: string;
  date_previous_update: number;
  date_update: number;
  added_users: string[];
  added_users_count: number;
  removed_users: string[];
  removed_users_count: number;
}

export interface SubteamSelfAddedEvent extends StringIndexed {
  type: 'subteam_self_added';
  subteam_id: string;
}

export interface SubteamSelfRemovedEvent extends StringIndexed {
  type: 'subteam_self_removed';
  subteam_id: string;
}

export interface SubteamUpdatedEvent extends StringIndexed {
  type: 'subteam_updated';
  // TODO: incomplete, this should probably be a reference to a Usergroup shape from @slack/types.
  // https://api.slack.com/types/usergroup
  subteam: {
    id: string;
  };
}

export interface TeamDomainChangedEvent extends StringIndexed {
  type: 'team_domain_changed';
  url: string;
  domain: string;
}

export interface TeamJoinEvent extends StringIndexed {
  type: 'team_join';
  // TODO: incomplete, this should probably be a reference to a User shape from @slack/types.
  // https://api.slack.com/types/user
  user: {
  };
}

export interface TeamRenameEvent extends StringIndexed {
  type: 'team_rename';
  name: string;
}

export interface TokensRevokedEvent extends StringIndexed {
  type: 'tokens_revoked';
  tokens: {
    // TODO: are either or both of these optional?
    oauth: string[];
    bot: string[];
  };
}

// NOTE: url_verification does not use the envelope, but its also not interesting for an app developer. its omitted.

export interface UserChangeEvent extends StringIndexed {
  type: 'user_change';
  // TODO: incomplete, this should probably be a reference to a User shape from @slack/types.
  // https://api.slack.com/types/user
  user: {
  };
}

// NOTE: `user_resourced_denied`, `user_resource_granted`, `user_resourced_removed` are left out because they are
// deprecated as part of the Workspace Apps Developer Preview
