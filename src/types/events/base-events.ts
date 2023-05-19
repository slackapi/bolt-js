import { View, MessageAttachment, KnownBlock, Block } from '@slack/types';
import { MessageEvent as AllMessageEvents, MessageMetadataEvent as AllMessageMetadataEvents } from './message-events';

/**
 * All known event types in Slack's Events API
 * Please refer to https://api.slack.com/events for more details
 *
 * This is a discriminated union. The discriminant is the `type` property.
 */
export type SlackEvent =
  | AppRequestedEvent
  | AppHomeOpenedEvent
  | AppMentionEvent
  | AppRateLimitedEvent
  | AppUninstalledEvent
  | CallRejectedEvent
  | ChannelArchiveEvent
  | ChannelCreatedEvent
  | ChannelDeletedEvent
  | ChannelHistoryChangedEvent
  | ChannelIDChangedEvent
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
  | MessageMetadataEvent
  | PinAddedEvent
  | PinRemovedEvent
  | ReactionAddedEvent
  | ReactionRemovedEvent
  | SharedChannelInviteReceived
  | SharedChannelInviteAccepted
  | SharedChannelInviteApproved
  | SharedChannelInviteDeclined
  | StarAddedEvent
  | StarRemovedEvent
  | SubteamCreated
  | SubteamMembersChanged
  | SubteamSelfAddedEvent
  | SubteamSelfRemovedEvent
  | SubteamUpdatedEvent
  | TeamAccessGrantedEvent
  | TeamAccessRevokedEvent
  | TeamDomainChangedEvent
  | TeamJoinEvent
  | TeamRenameEvent
  | TokensRevokedEvent
  | UserChangeEvent
  | UserHuddleChangedEvent
  | UserProfileChangedEvent
  | UserStatusChangedEvent
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

interface BotProfile {
  id: string;
  name: string;
  app_id: string;
  team_id: string;
  icons: {
    [size: string]: string;
  };
  updated: number;
  deleted: boolean;
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
      icons?: {
        image_32?: string;
        image_36?: string;
        image_48?: string;
        image_64?: string;
        image_72?: string;
        image_96?: string;
        image_128?: string;
        image_192?: string;
        image_512?: string;
        image_1024?: string;
        image_original?: string;
      }
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
  is_user_app_collaborator: boolean;
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
  bot_profile?: BotProfile;
  username: string;
  team?: string;
  user?: string;
  text: string;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  edited?: {
    user: string;
    ts: string;
  };
  ts: string;
  channel: string;
  event_ts: string;
  thread_ts?: string;
}

export interface AppRateLimitedEvent {
  type: 'app_rate_limited';
  token: string;
  team_id: string;
  minute_rate_limited: number;
  api_app_id: string;
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
  is_moved?: number;
  event_ts: string;
}

export interface ChannelCreatedEvent {
  type: 'channel_created';
  channel: {
    id: string;
    is_channel: boolean;
    name: string;
    name_normalized: string;
    created: number;
    creator: string; // user ID
    is_shared: boolean;
    is_org_shared: boolean;
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
  actor_id: string;
  event_ts: string;
}

export interface ChannelRenameEvent {
  type: 'channel_rename';
  channel: {
    id: string;
    name: string;
    name_normalized: string;
    created: number;
    is_channel: boolean;
    is_mpim: boolean;
  };
  event_ts: string;
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
  event_ts: string;
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
  event_ts: string;
}

export interface DNDUpdatedUserEvent {
  type: 'dnd_updated_user';
  user: string;
  dnd_status: {
    dnd_enabled: boolean;
    next_dnd_start_ts: number;
    next_dnd_end_ts: number;
  };
  event_ts: string;
}

export interface EmailDomainChangedEvent {
  type: 'email_domain_changed';
  email_domain: string;
  event_ts: string;
}

// NOTE: this should probably be broken into its two subtypes
export interface EmojiChangedEvent {
  type: 'emoji_changed';
  subtype: 'add' | 'remove' | 'rename';
  names?: string[]; // only for remove
  name?: string; // only for add
  value?: string; // only for add
  old_name?: string;
  new_name?: string;
  event_ts: string;
}

export interface FileChangeEvent {
  type: 'file_change';
  file_id: string;
  file: {
    id: string;
  };
}

// NOTE: `file_comment_added` and `file_comment_edited` are left out because they are discontinued

export interface FileCommentDeletedEvent {
  type: 'file_comment_deleted';
  comment: string; // this is an ID
  file_id: string;
  file: {
    id: string;
  };
}

export interface FileCreatedEvent {
  type: 'file_created';
  file_id: string;
  user_id: string;
  file: {
    id: string;
  };
  event_ts: string;
}

export interface FileDeletedEvent {
  type: 'file_deleted';
  file_id: string;
  channel_ids?: string[];
  event_ts: string;
}

export interface FilePublicEvent {
  type: 'file_public';
  file_id: string;
  user_id: string;
  file: {
    id: string;
  };
  event_ts: string;
}

export interface FileSharedEvent {
  type: 'file_shared';
  file_id: string;
  user_id: string;
  file: {
    id: string;
  };
  channel_id: string;
  event_ts: string;
}

export interface FileUnsharedEvent {
  type: 'file_unshared';
  file_id: string;
  user_id: string;
  file: {
    id: string;
  };
  channel_id: string;
  event_ts: string;
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
  user: string;
  is_moved: number;
  event_ts: string;
}

export interface GroupCloseEvent {
  type: 'group_close';
  user: string;
  channel: string;
}

export interface GroupDeletedEvent {
  type: 'group_deleted';
  channel: string;
  date_deleted: number;
  actor_id: string;
  event_ts: string;
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
  actor_id: string;
  event_ts: string;
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
    name_normalized: string;
    created: number;
    is_channel: boolean;
    is_mpim: boolean;
  };
  event_ts: string;
}

export interface GroupUnarchiveEvent {
  type: 'group_unarchive';
  channel: string;
  actor_id: string;
  event_ts: string;
}

export interface IMCloseEvent {
  type: 'im_close';
  user: string;
  channel: string;
  event_ts: string;
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
  event_ts: string;
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
  is_bot_user_member: boolean;
  user: string;
  message_ts: string;
  thread_ts?: string;
  links: {
    domain: string;
    url: string;
  }[];
  unfurl_id?: string;
  source?: string;
  event_ts: string;
}

export interface MemberJoinedChannelEvent {
  type: 'member_joined_channel';
  user: string;
  channel: string;
  channel_type: string;
  team: string;
  inviter?: string;
  event_ts: string;
}

export interface MemberLeftChannelEvent {
  type: 'member_left_channel';
  user: string;
  channel: string;
  channel_type: string;
  team: string;
  event_ts: string;
}

export type MessageEvent = AllMessageEvents;

export type MessageMetadataEvent = AllMessageMetadataEvents;

export interface PinnedMessageItem {
  client_msg_id?: string;
  type: string;
  app_id?: string;
  team?: string;
  user: string;
  bot_id?: string;
  bot_profile?: BotProfile;
  text?: string;
  attachments?: MessageAttachment[];
  blocks?: (KnownBlock | Block)[];
  pinned_to?: string[];
  permalink: string;
}
export interface PinnedFileItem {
  id: string;
  // TODO: Add all other possible properties here
}

export interface PinnedItem {
  type: string;
  channel: string;
  created_by: string;
  created: number;
  message?: PinnedMessageItem;
  file?: PinnedFileItem;
}
export interface PinAddedEvent {
  type: 'pin_added';
  user: string;
  channel_id: string;
  item: PinnedItem;
  item_user: string;
  pin_count: string;
  pinned_info: {
    channel: string;
    pinned_by: string;
    pinned_ts: number;
  };
  event_ts: string;
}
export interface PinRemovedEvent {
  type: 'pin_removed';
  user: string;
  channel_id: string;
  item: PinnedItem;
  item_user: string;
  pin_count: string;
  pinned_info: {
    channel: string;
    pinned_by: string;
    pinned_ts: number;
  };
  has_pins: boolean;
  event_ts: string;
}

export interface ReactionMessageItem {
  type: 'message';
  channel: string;
  ts: string;
}

/**
 * @deprecated Slack applications no longer receive reaction events for files and file comments.
 */
export interface ReactionFileItem {
  type: 'file';
  channel: string;
  file: string;
}

// This type is deprecated.
// See https://api.slack.com/changelog/2018-05-file-threads-soon-tread
export interface ReactionFileCommentItem {
  type: 'file_comment';
  channel: string;
  file_comment: string;
  file: string;
}

export interface ReactionAddedEvent {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item_user: string;
  item: ReactionMessageItem;
  event_ts: string;
}

export interface ReactionRemovedEvent {
  type: 'reaction_removed';
  user: string;
  reaction: string;
  item_user: string;
  item: ReactionMessageItem;
  event_ts: string;
}

// NOTE: `resources_added`, `resources_removed`, `scope_denied`, `scope_granted`, are left out because they are
// deprecated as part of the Workspace Apps Developer Preview

export interface SharedChannelTeamItem {
  id: string;
  name: string;
  icon: Record<string, unknown>;
  is_verified: boolean;
  domain: string;
  date_created: number;
}
export interface SharedChannelUserItem {
  id: string;
  team_id: string;
  name: string;
  updated: number;
  profile: {
    real_name: string;
    display_name: string;
    real_name_normalized: string;
    display_name_normalized: string;
    team: string;
    avatar_hash: string;
    email: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
  };
}
export interface SharedChannelInviteItem {
  id: string;
  date_created: number;
  date_invalid: number;
  inviting_team: SharedChannelTeamItem;
  inviting_user: SharedChannelUserItem;
  recipient_email?: string;
  recipient_user_id?: string;
}

export interface SharedChannelItem {
  id: string;
  is_private: boolean;
  is_im: boolean;
  name: string;
}
export interface SharedChannelInviteAccepted {
  type: 'shared_channel_invite_accepted';
  approval_required: boolean;
  invite: SharedChannelInviteItem;
  channel: SharedChannelItem;
  teams_in_channel: SharedChannelTeamItem[];
  accepting_user: SharedChannelUserItem;
  event_ts: string;
}

export interface SharedChannelInviteApproved {
  type: 'shared_channel_invite_approved';
  invite: SharedChannelInviteItem;
  channel: SharedChannelItem;
  approving_team_id: string;
  teams_in_channel: SharedChannelTeamItem[];
  approving_user: SharedChannelUserItem;
  event_ts: string;
}

export interface SharedChannelInviteDeclined {
  type: 'shared_channel_invite_declined';
  invite: SharedChannelInviteItem;
  channel: SharedChannelItem;
  declining_team_id: string;
  teams_in_channel: SharedChannelTeamItem[];
  declining_user: SharedChannelUserItem;
  event_ts: string;
}

export interface SharedChannelInviteReceived {
  type: 'shared_channel_invite_received';
  invite: SharedChannelInviteItem;
  channel: SharedChannelItem;
  event_ts: string;
}

export interface StarAddedEvent {
  type: 'star_added';
  user: string;
  // TODO: incomplete, items are of type message | file | file comment (deprecated) | channel | im | group
  // https://api.slack.com/events/star_added, https://api.slack.com/methods/stars.list
  item: Record<string, unknown>;
  event_ts: string;
}

export interface StarRemovedEvent {
  type: 'star_removed';
  user: string;
  // TODO: incomplete, items are of type message | file | file comment (deprecated) | channel | im | group
  // https://api.slack.com/events/star_removed, https://api.slack.com/methods/stars.list
  item: Record<string, unknown>;
  event_ts: string;
}

interface Subteam {
  id: string;
  team_id?: string;
  is_usergroup: boolean;
  is_subteam: boolean;
  name: string;
  description?: string;
  handle: string;
  is_external: boolean;
  date_create: number;
  date_update?: number;
  date_delete?: number;
  auto_provision: boolean;
  enterprise_subteam_id?: string;
  created_by: string;
  updated_by?: string;
  prefs?: {
    channels?: string[];
    groups?: string[];
  };
  users: string[];
  user_count: number;
  channel_count?: number;
}

export interface SubteamCreated {
  type: 'subteam_created';
  subteam: Subteam;
  event_ts: string;
}

export interface SubteamMembersChanged {
  type: 'subteam_members_changed';
  subteam_id: string;
  team_id: string;
  date_previous_update: number;
  date_update: number;
  added_users?: string[];
  added_users_count?: number;
  removed_users?: string[];
  removed_users_count?: number;
  event_ts: string;
}

export interface SubteamSelfAddedEvent {
  type: 'subteam_self_added';
  subteam_id: string;
  event_ts: string;
}

export interface SubteamSelfRemovedEvent {
  type: 'subteam_self_removed';
  subteam_id: string;
  event_ts: string;
}

export interface SubteamUpdatedEvent {
  type: 'subteam_updated';
  subteam: Subteam;
  event_ts: string;
}

export interface TeamAccessGrantedEvent {
  type: 'team_access_granted';
  team_ids: string[];
  event_ts: string;
}

export interface TeamAccessRevokedEvent {
  type: 'team_access_revoked';
  team_ids: string[];
  event_ts: string;
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
    oauth?: string[];
    bot?: string[];
  };
}

// NOTE: url_verification does not use the envelope, but its also not interesting for an app developer. its omitted.

export interface StatusEmojiDisplayInfo {
  emoji_name?: string;
  display_alias?: string;
  display_url?: string;
}

export interface UserChangeEvent {
  type: 'user_change';
  user: {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: {
      title: string;
      phone: string;
      skype: string;
      real_name: string;
      real_name_normalized: string;
      display_name: string;
      display_name_normalized: string;
      status_text: string;
      status_text_canonical: string;
      status_emoji: string;
      status_emoji_display_info: StatusEmojiDisplayInfo[];
      status_expiration: number;
      avatar_hash: string;
      huddle_state?: string;
      huddle_state_expiration_ts?: number;
      first_name: string;
      last_name: string;
      email?: string;
      image_original?: string;
      is_custom_image?: boolean;
      image_24: string;
      image_32: string;
      image_48: string;
      image_72: string;
      image_192: string;
      image_512: string;
      image_1024?: string;
      team: string;
      fields:
      | {
        [key: string]: {
          value: string;
          alt: string;
        };
      }
      | []
      | null;
    };
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_stranger?: boolean;
    updated: number;
    is_email_confirmed: boolean;
    is_app_user: boolean;
    is_invited_user?: boolean;
    has_2fa?: boolean;
    locale: string;
    presence?: string;
    enterprise_user?: {
      id: string;
      enterprise_id: string;
      enterprise_name: string;
      is_admin: boolean;
      is_owner: boolean;
      teams: string[];
    };
    two_factor_type?: string;
    has_files?: boolean;
    is_workflow_bot?: boolean;
    who_can_share_contact_card: string;
  };
  cache_ts: number;
  event_ts: string;
}

export interface UserHuddleChangedEvent {
  type: 'user_huddle_changed';
  user: {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: {
      title: string;
      phone: string;
      skype: string;
      real_name: string;
      real_name_normalized: string;
      display_name: string;
      display_name_normalized: string;
      status_text: string;
      status_text_canonical: string;
      status_emoji: string;
      status_emoji_display_info: StatusEmojiDisplayInfo[];
      status_expiration: number;
      avatar_hash: string;
      huddle_state: string;
      huddle_state_expiration_ts: number;
      first_name: string;
      last_name: string;
      email?: string;
      image_original?: string;
      is_custom_image?: boolean;
      image_24: string;
      image_32: string;
      image_48: string;
      image_72: string;
      image_192: string;
      image_512: string;
      image_1024?: string;
      team: string;
      fields:
      | {
        [key: string]: {
          value: string;
          alt: string;
        };
      }
      | []
      | null;
    };
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_stranger?: boolean;
    updated: number;
    is_email_confirmed: boolean;
    is_app_user: boolean;
    is_invited_user?: boolean;
    has_2fa?: boolean;
    locale: string;
    presence?: string;
    enterprise_user?: {
      id: string;
      enterprise_id: string;
      enterprise_name: string;
      is_admin: boolean;
      is_owner: boolean;
      teams: string[];
    };
    two_factor_type?: string;
    has_files?: boolean;
    is_workflow_bot?: boolean;
    who_can_share_contact_card: string;
  };
  cache_ts: number;
  event_ts: string;
}

export interface UserProfileChangedEvent {
  type: 'user_profile_changed';
  user: {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: {
      title: string;
      phone: string;
      skype: string;
      real_name: string;
      real_name_normalized: string;
      display_name: string;
      display_name_normalized: string;
      status_text: string;
      status_text_canonical: string;
      status_emoji: string;
      status_emoji_display_info: StatusEmojiDisplayInfo[];
      status_expiration: number;
      avatar_hash: string;
      huddle_state: string;
      huddle_state_expiration_ts: number;
      first_name: string;
      last_name: string;
      email?: string;
      image_original?: string;
      is_custom_image?: boolean;
      image_24: string;
      image_32: string;
      image_48: string;
      image_72: string;
      image_192: string;
      image_512: string;
      image_1024?: string;
      team: string;
      fields:
      | {
        [key: string]: {
          value: string;
          alt: string;
        };
      }
      | []
      | null;
    };
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_stranger?: boolean;
    updated: number;
    is_email_confirmed: boolean;
    is_app_user: boolean;
    is_invited_user?: boolean;
    has_2fa?: boolean;
    locale: string;
    presence?: string;
    enterprise_user?: {
      id: string;
      enterprise_id: string;
      enterprise_name: string;
      is_admin: boolean;
      is_owner: boolean;
      teams: string[];
    };
    two_factor_type?: string;
    has_files?: boolean;
    is_workflow_bot?: boolean;
    who_can_share_contact_card: string;
  };
  cache_ts: number;
  event_ts: string;
}

export interface UserStatusChangedEvent {
  type: 'user_status_changed';
  user: {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    color: string;
    real_name: string;
    tz: string;
    tz_label: string;
    tz_offset: number;
    profile: {
      title: string;
      phone: string;
      skype: string;
      real_name: string;
      real_name_normalized: string;
      display_name: string;
      display_name_normalized: string;
      status_text: string;
      status_text_canonical: string;
      status_emoji: string;
      status_emoji_display_info: StatusEmojiDisplayInfo[],
      status_expiration: number;
      avatar_hash: string;
      first_name: string;
      last_name: string;
      email?: string;
      image_original?: string;
      is_custom_image?: boolean;
      image_24: string;
      image_32: string;
      image_48: string;
      image_72: string;
      image_192: string;
      image_512: string;
      image_1024?: string;
      team: string;
      fields:
      | {
        [key: string]: {
          value: string;
          alt: string;
        };
      }
      | []
      | null;
    };
    is_admin: boolean;
    is_owner: boolean;
    is_primary_owner: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    is_bot: boolean;
    is_stranger?: boolean;
    updated: number;
    is_email_confirmed: boolean;
    is_app_user: boolean;
    is_invited_user?: boolean;
    has_2fa?: boolean;
    locale: string;
    presence?: string;
    enterprise_user?: {
      id: string;
      enterprise_id: string;
      enterprise_name: string;
      is_admin: boolean;
      is_owner: boolean;
      teams: string[];
    };
    two_factor_type?: string;
    has_files?: boolean;
    is_workflow_bot?: boolean;
    who_can_share_contact_card: string;
  };
  cache_ts: number;
  event_ts: string;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
