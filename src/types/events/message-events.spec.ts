import { assert } from 'chai';
import { BotMessageEvent, GenericMessageEvent, MessageEvent } from './message-events';

describe('message event types', () => {
  it('should be compatible with bot_message payload', () => {
    const payload: BotMessageEvent = {
      type: 'message',
      subtype: 'bot_message',
      bot_id: '',
      username: '',
      icons: {},
      channel: '',
      text: '',
      blocks: [],
      thread_ts: '',
      ts: '',
      event_ts: '',
      channel_type: 'channel',
    };
    assert.isNotEmpty(payload);
  });

  it('should be compatible with channel_archive payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_archive',
      team: '',
      user: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with channel_join payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_join',
      team: '',
      user: '',
      inviter: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with channel_leave payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_leave',
      team: '',
      user: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with channel_name payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_name',
      team: '',
      user: '',
      name: '',
      old_name: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with channel_posting_permissions payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_posting_permissions',
      user: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with channel_purpose payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_purpose',
      user: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      purpose: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with channel_topic payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_topic',
      user: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      topic: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with channel_unarchive payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'channel_unarchive',
      team: '',
      user: '',
      channel: '',
      channel_type: 'channel',
      text: '',
      ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with file_share payload', () => {
    const payload: MessageEvent = {
      type: 'message',
      subtype: 'file_share',
      user: '',
      channel: '',
      channel_type: 'channel',
      blocks: [],
      attachments: [],
      files: [],
      upload: false,
      display_as_bot: false,
      parent_user_id: '',
      text: '',
      ts: '',
      thread_ts: '',
      event_ts: '',
    };
    assert.isNotEmpty(payload);
  });
  it('should be compatible with message with bot info', () => {
    const payload: GenericMessageEvent = {
      type: 'message',
      subtype: undefined,
      text: 'Hi there! Thanks for sharing the info!',
      user: 'UB111',
      ts: '1610261539.000900',
      team: 'T111',
      bot_id: 'B999',
      bot_profile: {
        id: 'B999',
        deleted: false,
        name: 'other-app',
        updated: 1607307935,
        app_id: 'A222',
        icons: {
          image_36: 'https://a.slack-edge.com/80588/img/plugins/app/bot_36.png',
          image_48: 'https://a.slack-edge.com/80588/img/plugins/app/bot_48.png',
          image_72: 'https://a.slack-edge.com/80588/img/plugins/app/service_72.png',
        },
        team_id: 'T111',
      },
      channel: 'C111',
      event_ts: '1610261539.000900',
      channel_type: 'channel',
    };
    assert.isNotEmpty(payload);
  });
});
