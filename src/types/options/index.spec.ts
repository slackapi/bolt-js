// tslint:disable:no-implicit-dependencies
import { assert } from 'chai';
import { BlockSuggestion, DialogSuggestion, InteractiveMessageSuggestion } from './index';

describe('options types', () => {
  it('should be compatible with block_suggestion payloads', () => {
    const payload: BlockSuggestion = {
      type: 'block_suggestion',
      user: {
        id: 'W111',
        name: 'primary-owner',
        team_id: 'T111',
      },
      container: { type: 'view', view_id: 'V111' },
      api_app_id: 'A111',
      token: 'verification_token',
      block_id: 'block-id-value',
      action_id: 'action-id-value',
      value: 'search word',
      team: {
        id: 'T111',
        domain: 'workspace-domain',
        enterprise_id: 'E111',
        enterprise_name: 'Sandbox Org',
      },
      view: {
        id: 'V111',
        team_id: 'T111',
        type: 'modal',
        blocks: [
          {
            type: 'input',
            block_id: '5ar+',
            label: { type: 'plain_text', text: 'Label' },
            optional: false,
            element: { type: 'plain_text_input', action_id: 'i5IpR' },
          },
          {
            type: 'input',
            block_id: 'block-id-value',
            label: { type: 'plain_text', text: 'Search' },
            optional: false,
            element: {
              type: 'external_select',
              action_id: 'action-id-value',
              placeholder: { type: 'plain_text', text: 'Select an item' },
            },
          },
          {
            type: 'input',
            block_id: 'xxx',
            label: { type: 'plain_text', text: 'Search (multi)' },
            optional: false,
            element: {
              type: 'multi_external_select',
              action_id: 'yyy',
              placeholder: { type: 'plain_text', text: 'Select an item' },
            },
          },
        ],
        private_metadata: '',
        callback_id: 'view-id',
        state: { values: {} },
        hash: '111.xxx',
        title: { type: 'plain_text', text: 'My App' },
        clear_on_close: false,
        notify_on_close: false,
        close: { type: 'plain_text', text: 'Cancel' },
        submit: { type: 'plain_text', text: 'Submit' },
        root_view_id: 'V111',
        previous_view_id: null,
        app_id: 'A111',
        external_id: '',
        app_installed_team_id: 'T111',
        bot_id: 'B111',
      },
    };
    assert.equal(payload.action_id, 'action-id-value');
    assert.equal(payload.value, 'search word');
  });

  it('should be compatible with interactive_message payloads', () => {
    const payload: InteractiveMessageSuggestion = {
      name: 'bugs_list',
      value: 'bot',
      callback_id: 'select_remote_1234',
      type: 'interactive_message',
      team: {
        id: 'T012AB0A1',
        domain: 'pocket-calculator',
      },
      channel: {
        id: 'C012AB3CD',
        name: 'general',
      },
      user: {
        id: 'U012A1BCJ',
        name: 'bugcatcher',
      },
      action_ts: '1481670445.010908',
      message_ts: '1481670439.000007',
      attachment_id: '1',
      token: 'verification_token_string',
    };
    assert.equal(payload.callback_id, 'select_remote_1234');
    assert.equal(payload.value, 'bot');
  });

  it('should be compatible with dialog_suggestion payloads', () => {
    const payload: DialogSuggestion = {
      type: 'dialog_suggestion',
      token: 'verification_token',
      action_ts: '1596603332.676855',
      team: {
        id: 'T111',
        domain: 'workspace-domain',
        enterprise_id: 'E111',
        enterprise_name: 'Sandbox Org',
      },
      user: { id: 'W111', name: 'primary-owner', team_id: 'T111' },
      channel: { id: 'C111', name: 'test-channel' },
      name: 'types',
      value: 'search keyword',
      callback_id: 'dialog-callback-id',
      state: 'Limo',
    };
    assert.equal(payload.callback_id, 'dialog-callback-id');
    assert.equal(payload.value, 'search keyword');
  });
});
