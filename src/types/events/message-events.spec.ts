// tslint:disable:no-implicit-dependencies
import { assert } from 'chai';
import { BotMessageEvent, MessageEvent } from './message-events';

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
});
