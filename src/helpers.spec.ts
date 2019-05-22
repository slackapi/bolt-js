// tslint:disable:no-implicit-dependencies
import { assert } from 'chai';
import { getTypeAndConversation, IncomingEventType } from './helpers';
import { SlackAction } from './types';
import { Func } from 'mocha';

describe('getTypeAndConversation()', () => {
  function matchesActionType(actionType: string): Func {
    return () => {
      // Arrange
      const messageActionBody: SlackAction = createFakeMessageAction(actionType);

      // Act
      const typeAndConversation = getTypeAndConversation(messageActionBody);

      // Assert
      assert(typeAndConversation.type === IncomingEventType.Action);
    };
  }

  describe('action types', () => {
    it('should find Action type for message actions', matchesActionType('message_action'));
    it('should find Action type for dialog submissions', matchesActionType('dialog_submission'));
    it('should find Action type for block actions', matchesActionType('block_actions'));
    it('should find Action type for interactive actions', matchesActionType('interactive_message'));
  });
});

function createFakeMessageAction(actionType: string): SlackAction {
  const action: Partial<SlackAction> = {
    type: actionType,
    channel: { id: 'CHANNEL_ID', name: 'CHANNEL_NAME' },
    user: { id: 'USER_ID', name: 'USER_NAME' },
    team: { id: 'TEAM_ID', domain: 'TEAM_DOMAIN' },
    response_url: 'https://hooks.slack.com/actions/RESPONSE_URL',
    token: 'TOKEN',
  };

  if (actionType === 'interactive_message') {
    action.actions = [{
      type: 'button',
      name: 'NAME',
      value: 'VALUE',
    }];
  }

  if (actionType === 'block_actions') {
    action.actions = [{
      type: 'button',
      value: 'VALUE',
      text: {
        type: 'plain_text',
        text: 'TEXT',
      },
      block_id: 'BLOCK_ID',
      action_id: 'ACTION_ID',
      action_ts: 'ACTION_TS',
    }];
  }

  return action as SlackAction;
}
