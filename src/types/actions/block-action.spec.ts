import { assert } from 'chai';
import {
  BlockAction,
  MultiStaticSelectAction,
  MultiChannelsSelectAction,
  MultiUsersSelectAction,
  MultiConversationsSelectAction,
} from './block-action';

describe('Interactivity payload types', () => {
  describe('block-action action types', () => {
    it('should be compatible with block_actions payloads', () => {
      const payload: BlockAction = {
        type: 'block_actions',
        user: {
          id: 'W111',
          username: 'seratch',
          team_id: 'T111',
        },
        api_app_id: 'A02',
        token: 'Shh_its_a_seekrit',
        container: {
          type: 'message',
          text: 'The contents of the original message where the action originated',
        },
        trigger_id: '12466734323.1395872398',
        team: {
          id: 'T111',
          domain: 'foo',
          enterprise_id: 'E111',
          enterprise_name: 'Acme Corp',
        },
        enterprise: {
          id: 'E111',
          name: 'Acme Corp',
        },
        is_enterprise_install: false,
        response_url: 'https://www.postresponsestome.com/T123567/1509734234',
        // as of April 2021, actions have only one element though
        actions: [
          {
            type: 'multi_conversations_select',
            block_id: 'b',
            action_id: 'multi_conversations_select-action',
            selected_conversations: ['C111', 'C222'],
            action_ts: '1618009079.687263',
          },
          {
            type: 'multi_conversations_select',
            block_id: 'b',
            action_id: 'multi_conversations_select-action',
            selected_conversations: ['C111', 'C222'],
            action_ts: '1618009079.687263',
          },
        ],
      };
      assert.equal(payload.actions.length, 2);
    });
    it('should be compatible with multi_users_select payloads', () => {
      const payload: MultiUsersSelectAction = {
        type: 'multi_users_select',
        block_id: 'b',
        action_id: 'a',
        action_ts: '111',
        selected_users: ['W111', 'W222'],
        initial_users: ['W111', 'W222'],
      };
      assert.equal(payload.selected_users.length, 2);
      assert.equal(payload.initial_users?.length, 2);
    });
    it('should be compatible with multi_conversations_select payloads', () => {
      const payload: MultiConversationsSelectAction = {
        type: 'multi_conversations_select',
        block_id: 'b',
        action_id: 'a',
        action_ts: '111',
        selected_conversations: ['C111', 'C222'],
        initial_conversations: ['C111', 'C222'],
      };
      assert.equal(payload.selected_conversations.length, 2);
      assert.equal(payload.initial_conversations?.length, 2);
    });
    it('should be compatible with multi_channels_select payloads', () => {
      const payload: MultiChannelsSelectAction = {
        type: 'multi_channels_select',
        block_id: 'b',
        action_id: 'a',
        action_ts: '111',
        selected_channels: ['C111', 'C222'],
        initial_channels: ['C111', 'C222'],
      };
      assert.equal(payload.selected_channels.length, 2);
      assert.equal(payload.initial_channels?.length, 2);
    });
  });

  describe('block-action element types', () => {
    it('should be compatible with multi_static_select payloads', () => {
      const payload: MultiStaticSelectAction = {
        type: 'multi_static_select',
        block_id: 'b',
        action_id: 'a',
        action_ts: '111',
        selected_options: [
          {
            text: {
              type: 'plain_text',
              text: '*this is plain_text text*',
              emoji: true,
            },
            value: 'value-0',
          },
          {
            text: {
              type: 'plain_text',
              text: '*this is plain_text text*',
              emoji: true,
            },
            value: 'value-1',
          },
        ],
        initial_options: [
          {
            text: {
              type: 'plain_text',
              text: '*this is plain_text text*',
              emoji: true,
            },
            value: 'value-0',
          },
          {
            text: {
              type: 'plain_text',
              text: '*this is plain_text text*',
              emoji: true,
            },
            value: 'value-1',
          },
        ],
      };
      assert.equal(payload.selected_options.length, 2);
      assert.equal(payload.initial_options?.length, 2);
    });
    it('should be compatible with multi_users_select payloads', () => {
      const payload: MultiUsersSelectAction = {
        type: 'multi_users_select',
        block_id: 'b',
        action_id: 'a',
        action_ts: '111',
        selected_users: ['W111', 'W222'],
        initial_users: ['W111', 'W222'],
      };
      assert.equal(payload.selected_users.length, 2);
      assert.equal(payload.initial_users?.length, 2);
    });
    it('should be compatible with multi_conversations_select payloads', () => {
      const payload: MultiConversationsSelectAction = {
        type: 'multi_conversations_select',
        block_id: 'b',
        action_id: 'a',
        action_ts: '111',
        selected_conversations: ['C111', 'C222'],
        initial_conversations: ['C111', 'C222'],
      };
      assert.equal(payload.selected_conversations.length, 2);
      assert.equal(payload.initial_conversations?.length, 2);
    });
    it('should be compatible with multi_channels_select payloads', () => {
      const payload: MultiChannelsSelectAction = {
        type: 'multi_channels_select',
        block_id: 'b',
        action_id: 'a',
        action_ts: '111',
        selected_channels: ['C111', 'C222'],
        initial_channels: ['C111', 'C222'],
      };
      assert.equal(payload.selected_channels.length, 2);
      assert.equal(payload.initial_channels?.length, 2);
    });
  });
});
