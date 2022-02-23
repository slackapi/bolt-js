import { assert } from 'chai';
import { InteractiveMessage, ButtonClick } from './interactive-message';

describe('Message shortcut payload types', () => {
  it('should be compatible with block_actions payloads', () => {
    const payload: InteractiveMessage<ButtonClick> = {
      type: 'interactive_message',
      actions: [
        {
          name: 'foo',
          type: 'button',
          value: 'bar',
        },
        {
          name: 'foo',
          type: 'button',
          value: 'bar',
        },
      ],
      callback_id: 'id',
      enterprise: {
        id: 'E111',
        name: 'test-org',
      },
      team: {
        id: 'T111',
        domain: 'team-domain',
        enterprise_id: 'E111',
        enterprise_name: 'test-org',
      },
      channel: {
        id: 'C111',
        name: 'random',
      },
      user: {
        id: 'W111',
        name: 'seratch',
        team_id: 'T111',
      },
      action_ts: '111.222',
      message_ts: '222.333',
      attachment_id: 'XXX',
      token: 'verificationt-oken',
      is_app_unfurl: false,
      original_message: {},
      response_url: 'https://hooks.slack.com/xxx',
      trigger_id: '1111111',
      is_enterprise_install: false,
    };
    assert.equal(payload.actions.length, 2);
  });
});
