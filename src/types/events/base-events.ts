import { View, MessageAttachment, KnownBlock, Block } from '@slack/types';
import { MessageEvent as AllMessageEvents } from './message-events';

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
  | CallRejectedEvent
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
  | InviteRequestedEvent
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
  | UserChangeEvent
  | WorkflowDeletedEvent
  | WorkflowPublishedEvent
  | WorkflowUnpublishedEvent
  | WorkflowStepDeletedEvent
  | WorkflowStepExecuteEvent;

export type EventTypePattern = string | RegExp;

/**
 * Any event in Slack's Events API
 *
 * This type is used to represent events that aren't known ahead of time. Each of the known event types also implement
 * this interface. That condition isn't enforced, since we're not interested in factoring out common properties from the
 * known event types.
 */
export interface BasicSlackEvent<Type extends string = string> {
  type: Type;
}

/* ------- TODO: Generate these interfaces ------- */

export interface AppRequestedEvent {
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

export interface AppHomeOpenedEvent {
  type: 'app_home_opened';
  user: string;
  channel: string;
  tab?: 'home' | 'messages';
  view?: View;
  event_ts: string;
}

// NOTE: this is essentially the same as the `message` event, except for the type and that this uses `event_ts` instead
// of `ts`
export interface AppMentionEvent {
  type: 'app_mention';
  subtype?: string;
  bot_id?: string;
  username: string;
  user?: string;
  text: string;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  ts: string;
  channel: string;
  event_ts: string;
  thread_ts: string;
}

// TODO: this event doesn't use the envelope. write test cases to make sure its works without breaking, and figure out
// what exceptions need to be made to the related types to make this work
// https://api.slack.com/events/app_rate_limited
// export interface AppRateLimitedEvent {
// }

export interface AppUninstalledEvent {
  type: 'app_uninstalled';
}

export interface CallRejectedEvent {
  type: 'call_rejected';
  call_id: string;
  user_id: string;
  channel_id: string;
  external_unique_id: string;
}

export interface ChannelArchiveEvent {
  type: 'channel_archive';
  channel: string;
  user: string;
}

export interface ChannelCreatedEvent {
  type: 'channel_created';
  channel: {
    id: string;
    name: string;
    created: number;
    creator: string; // user ID
  };
}

export interface ChannelDeletedEvent {
  type: 'channel_deleted';
  channel: string;
}

export interface ChannelHistoryChangedEvent {
  type: 'channel_history_changed';
  latest: string;
  ts: string;
  event_ts: string;
}

export interface ChannelIDChangedEvent {
  type: 'channel_id_changed';
  old_channel_id: string;
  new_channel_id: string;
  event_ts: string;
}

export interface ChannelLeftEvent {
  type: 'channel_left';
  channel: string;
}

export interface ChannelRenameEvent {
  type: 'channel_rename';
  channel: {
    id: string;
    name: string;
    created: number;
  };
}

export interface ChannelSharedEvent {
  type: 'channel_shared';
  connected_team_id: string;
  channel: string;
  event_ts: string;
}

export interface ChannelUnarchiveEvent {
  type: 'channel_unarchive';
  channel: string;
  user: string;
}

export interface ChannelUnsharedEvent {
  type: 'channel_unshared';
  previously_connected_team_id: string;
  channel: string;
  is_ext_shared: boolean;
  event_ts: string;
}

export interface DNDUpdatedEvent {
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

export interface DNDUpdatedUserEvent {
  type: 'dnd_updated_user';
  user: string;
  dnd_status: {
    dnd_enabled: boolean;
    next_dnd_start_ts: number;
    next_dnd_end_ts: number;
  };
}

export interface EmailDomainChangedEvent {
  type: 'email_domain_changed';
  email_domain: string;
  event_ts: string;
}

// NOTE: this should probably be broken into its two subtypes
export interface EmojiChangedEvent {
  type: 'emoji_changed';
  subtype: 'add' | 'remove';
  names?: string[]; // only for remove
  name?: string; // only for add
  value?: string; // only for add
  event_ts: string;
}

export interface FileChangeEvent {
  type: 'file_change';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

// NOTE: `file_comment_added` and `file_comment_edited` are left out because they are discontinued

export interface FileCommentDeletedEvent {
  type: 'file_comment_deleted';
  comment: string; // this is an ID
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileCreatedEvent {
  type: 'file_created';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileDeletedEvent {
  type: 'file_deleted';
  file_id: string;
  event_ts: string;
}

export interface FilePublicEvent {
  type: 'file_public';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileSharedEvent {
  type: 'file_shared';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface FileUnsharedEvent {
  type: 'file_unshared';
  file_id: string;
  // TODO: incomplete, this should be a reference to a File shape from @slack/types
  // https://api.slack.com/types/file
  file: {
    id: string;
  };
}

export interface GridMigrationFinishedEvent {
  type: 'grid_migration_finished';
  enterprise_id: string;
}

export interface GridMigrationStartedEvent {
  type: 'grid_migration_started';
  enterprise_id: string;
}

export interface GroupArchiveEvent {
  type: 'group_archive';
  channel: string;
}

export interface GroupCloseEvent {
  type: 'group_close';
  user: string;
  channel: string;
}

export interface GroupDeletedEvent {
  type: 'group_deleted';
  channel: string;
}

export interface GroupHistoryChangedEvent {
  type: 'group_history_changed';
  latest: string;
  ts: string;
  event_ts: string;
}

export interface GroupLeftEvent {
  type: 'group_left';
  channel: string;
}

export interface GroupOpenEvent {
  type: 'group_open';
  user: string;
  channel: string;
}

export interface GroupRenameEvent {
  type: 'group_rename';
  channel: {
    id: string;
    name: string;
    created: number;
  };
}

export interface GroupUnarchiveEvent {
  type: 'group_unarchive';
  channel: string;
}

export interface IMCloseEvent {
  type: 'im_close';
  user: string;
  channel: string;
}

export interface IMCreatedEvent {
  type: 'im_created';
  user: string;
  // TODO: incomplete, this should probably be a reference to a IM shape from @slack/types. can it just be a
  // Conversation shape? or should it be a Channel shape?
  // https://api.slack.com/types/im
  channel: {
    id: string;
  };
}

export interface IMHistoryChangedEvent {
  type: 'im_history_changed';
  latest: string;
  ts: string;
  event_ts: string;
}

export interface IMOpenEvent {
  type: 'im_open';
  user: string;
  channel: string;
}

export interface InviteRequestedEvent {
  type: 'invite_requested';
  invite_request: {
    id: string;
    email: string;
    date_created: number;
    requester_ids: string[];
    channel_ids: string[];
    invite_type: 'restricted' | 'ultra_restricted' | 'full_member';
    real_name: string;
    date_expire: number;
    request_reason: string;
    team: {
      id: string;
      name: string;
      domain: string;
    };
  };
}

export interface LinkSharedEvent {
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

export interface MemberJoinedChannelEvent {
  type: 'member_joined_channel';
  user: string;
  channel: string;
  channel_type: string;
  team: string;
  inviter?: string;
}

export interface MemberLeftChannelEvent {
  type: 'member_left_channel';
  user: string;
  channel: string;
  channel_type: string;
  team: string;
}

export type MessageEvent = AllMessageEvents;

export interface PinAddedEvent {
  type: 'pin_added';
  user: string;
  channel_id: string;
  // TODO: incomplete, should be message | file | file comment (deprecated)
  item: {};
}

export interface PinRemovedEvent {
  type: 'pin_removed';
  user: string;
  channel_id: string;
  // TODO: incomplete, should be message | file | file comment (deprecated)
  item: {};
  has_pins: boolean;
  event_ts: string;
}

export interface ReactionMessageItem {
  type: 'message';
  channel: string;
  ts: string;
}

export interface ReactionFileItem {
  type: 'file';
  file: string;
}

// This type is deprecated.
// See https://api.slack.com/changelog/2018-05-file-threads-soon-tread
export interface ReactionFileCommentItem {
  type: 'file_comment';
  file_comment: string;
  file: string;
}

export interface ReactionAddedEvent {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item_user: string;
  item: ReactionMessageItem | ReactionFileItem | ReactionFileCommentItem;
  event_ts: string;
}

export interface ReactionRemovedEvent {
  type: 'reaction_removed';
  user: string;
  reaction: string;
  item_user: string;
  // TODO: incomplete, should be message | file | file comment (deprecated)
  // https://api.slack.com/events/reaction_removed
  item: {};
  event_ts: string;
}

// NOTE: `resources_added`, `resources_removed`, `scope_denied`, `scope_granted`, are left out because they are
// deprecated as part of the Workspace Apps Developer Preview

export interface StarAddedEvent {
  type: 'star_added';
  user: string;
  // TODO: incomplete, items are of type message | file | file comment (deprecated) | channel | im | group
  // https://api.slack.com/events/star_added, https://api.slack.com/methods/stars.list
  item: {};
  event_ts: string;
}

export interface StarRemovedEvent {
  type: 'star_removed';
  user: string;
  // TODO: incomplete, items are of type message | file | file comment (deprecated) | channel | im | group
  // https://api.slack.com/events/star_removed, https://api.slack.com/methods/stars.list
  item: {};
  event_ts: string;
}

export interface SubteamCreated {
  type: 'subteam_created';
  // TODO: incomplete, this should probably be a reference to a Usergroup shape from @slack/types.
  // https://api.slack.com/types/usergroup
  subteam: {
    id: string;
    created_by: string;
  };
}

export interface SubteamMembersChanged {
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

export interface SubteamSelfAddedEvent {
  type: 'subteam_self_added';
  subteam_id: string;
}

export interface SubteamSelfRemovedEvent {
  type: 'subteam_self_removed';
  subteam_id: string;
}

export interface SubteamUpdatedEvent {
  type: 'subteam_updated';
  // TODO: incomplete, this should probably be a reference to a Usergroup shape from @slack/types.
  // https://api.slack.com/types/usergroup
  subteam: {
    id: string;
    created_by: string;
  };
}

export interface TeamDomainChangedEvent {
  type: 'team_domain_changed';
  url: string;
  domain: string;
}

export interface TeamJoinEvent {
  type: 'team_join';
  // TODO: incomplete, this should probably be a reference to a User shape from @slack/types.
  // https://api.slack.com/types/user
  user: {
    id: string;
  };
}

export interface TeamRenameEvent {
  type: 'team_rename';
  name: string;
}

export interface TokensRevokedEvent {
  type: 'tokens_revoked';
  tokens: {
    // TODO: are either or both of these optional?
    oauth: string[];
    bot: string[];
  };
}

// NOTE: url_verification does not use the envelope, but its also not interesting for an app developer. its omitted.

export interface UserChangeEvent {
  type: 'user_change';
  // TODO: incomplete, this should probably be a reference to a User shape from @slack/types.
  // https://api.slack.com/types/user
  user: {
    id: string;
  };
}

export interface WorkflowDeletedEvent {
  type: 'workflow_deleted';
  workflow_id: string;
  workflow_draft_configuration: {
    version_id: string;
    app_steps: {
      app_id: string;
      workflow_step_id: string;
      callback_id: string;
    }[];
  };
  event_ts: string;
}

export interface WorkflowPublishedEvent {
  type: 'workflow_published';
  workflow_id: string;
  workflow_published_configuration: {
    version_id: string;
    app_steps: {
      app_id: string;
      workflow_step_id: string;
      callback_id: string;
    }[];
  };
  event_ts: string;
}

export interface WorkflowUnpublishedEvent {
  type: 'workflow_unpublished';
  workflow_id: string;
  workflow_draft_configuration: {
    version_id: string;
    app_steps: {
      app_id: string;
      workflow_step_id: string;
      callback_id: string;
    }[];
  };
  event_ts: string;
}

export interface WorkflowStepDeletedEvent {
  type: 'workflow_step_deleted';
  workflow_id: string;
  workflow_draft_configuration: {
    version_id: string;
    app_steps: {
      app_id: string;
      workflow_step_id: string;
      callback_id: string;
    }[];
  };
  workflow_published_configuration?: {
    version_id: string;
    app_steps: {
      app_id: string;
      workflow_step_id: string;
      callback_id: string;
    }[];
  };
  event_ts: string;
}

export interface WorkflowStepExecuteEvent {
  type: 'workflow_step_execute';
  callback_id: string;
  workflow_step: {
    workflow_step_execute_id: string;
    workflow_id: string;
    workflow_instance_id: string;
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
  };
  event_ts: string;
}

// NOTE: `user_resourced_denied`, `user_resource_granted`, `user_resourced_removed` are left out because they are
// deprecated as part of the Workspace Apps Developer Preview
