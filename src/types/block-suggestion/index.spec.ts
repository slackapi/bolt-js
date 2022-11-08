import { assert } from 'chai';
import { BlockSuggestionPayload } from './index';

describe('External data source block suggestion event types', () => {
  it('should be compatible with non-enterprise block_suggestion payloads', () => {
    const payload: BlockSuggestionPayload = {
      type: 'block_suggestion',
      team: {
        id: 'test_team_id',
        domain: 'test_team',
      },
      enterprise: null,
      user: {
        id: 'user_id',
        name: 'user_name',
        team_id: 'test_team_id',
      },
      channel: {
        id: 'channel_id',
        name: 'directmessage',
      },
      message: {
        bot_id: 'bot_id',
        type: 'message',
        text: 'Enter an inspirational quote.',
        user: 'user_id_2',
        ts: '1667917196.579049',
        app_id: 'app_id',
        blocks: [
          {
            type: 'header',
            block_id: '3qxZz',
            text: {
              type: 'plain_text',
              text: 'Enter an inspirational quote',
              emoji: true,
            },
          },
          {
            type: 'input',
            block_id: 'ext_select_block',
            label: {
              type: 'plain_text',
              text: 'Inspirational Quote',
              emoji: true,
            },
            optional: true,
            dispatch_action: false,
            element: {
              type: 'external_select',
              action_id: 'ext_select_input',
              placeholder: {
                type: 'plain_text',
                text: 'Inspire',
                emoji: true,
              },
            },
          },
        ],
        team: 'test_team_id',
      },
      container: {
        type: 'message',
        message_ts: '1667917196.579049',
        channel_id: 'channel_id',
        is_ephemeral: false,
      },
      api_app_id: 'app_id',
      action_id: 'ext_select_input',
      block_id: 'ext_select_block',
      value: 'base',
      function_data: {
        execution_id: 'function_execution_id',
        function: {
          callback_id: 'review_approval',
        },
        inputs: {
          recipient: 'recipient_user_id',
          sender: 'sender_user_id',
        },
      },
      bot_access_token: 'xwfp-bot-access-token',
    };
    assert.equal(payload.action_id, 'ext_select_input');
    assert.equal(payload.value, 'base');
  });
  it('should be compatible with enterprise block_suggestion payloads', () => {
    const payload: BlockSuggestionPayload = {
      type: 'block_suggestion',
      team: null,
      enterprise: {
        id: 'enterprise_id',
        name: 'enterprise grid',
      },
      user: {
        id: 'user_id',
        name: 'user_name',
        team_id: 'test_team_id',
      },
      channel: {
        id: 'channel_id',
        name: 'directmessage',
      },
      message: {
        bot_id: 'bot_id',
        type: 'message',
        text: 'Enter an inspirational quote.',
        user: 'user_id_2',
        ts: '1667924878.557759',
        app_id: 'app_id',
        blocks: [
          {
            type: 'header',
            block_id: 'nyk',
            text: {
              type: 'plain_text',
              text: 'Enter an inspirational quote.',
              emoji: true,
            },
          },
          {
            type: 'input',
            block_id: 'ext_select_block',
            label: {
              type: 'plain_text',
              text: 'Inspirational Quote',
              emoji: true,
            },
            optional: true,
            dispatch_action: false,
            element: {
              type: 'external_select',
              action_id: 'ext_select_input',
              placeholder: {
                type: 'plain_text',
                text: 'Inspire',
                emoji: true,
              },
            },
          },
        ],
        team: 'test_team_id',
      },
      container: {
        type: 'message',
        message_ts: '1667924878.557759',
        channel_id: 'channel_id',
        is_ephemeral: false,
      },
      api_app_id: 'app_id',
      action_id: 'ext_select_input',
      block_id: 'ext_select_block',
      value: 'and',
      function_data: {
        execution_id: 'function_execution_id',
        function: {
          callback_id: 'review_approval',
        },
        inputs: {
          recipient: 'recipient_user_id',
          sender: 'sender_user_id',
        },
      },
      bot_access_token: 'xwfp-bot-access-token',
    };
    assert.equal(payload.action_id, 'ext_select_input');
    assert.equal(payload.value, 'and');
  });
});
