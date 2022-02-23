import 'mocha';
import { assert } from 'chai';
import { getTypeAndConversation, IncomingEventType } from './helpers';

describe('Helpers', () => {
  describe('getTypeAndConversation()', () => {
    describe('event types', () => {
      // Arrange
      const conversationId = 'CONVERSATION_ID';
      const dummyEventBody = {
        event: {
          type: 'app_home_opened',
          channel: conversationId,
        },
      };

      it('should find Event type for generic event', () => {
        // Act
        const typeAndConversation = getTypeAndConversation(dummyEventBody);
        // Assert
        assert(typeAndConversation.type === IncomingEventType.Event);
        assert(typeAndConversation.conversationId === conversationId);
      });
    });
    describe('command types', () => {
      // Arrange
      const conversationId = 'CONVERSATION_ID';
      const dummyCommandBody = {
        command: 'COMMAND_NAME',
        channel_id: conversationId,
        response_url: 'https://hooks.slack.com/commands/RESPONSE_URL',
      };
      it('should find Command type for generic command', () => {
        // Act
        const typeAndConversation = getTypeAndConversation(dummyCommandBody);
        // Assert
        assert(typeAndConversation.type === IncomingEventType.Command);
        assert(typeAndConversation.conversationId === conversationId);
      });
    });
    describe('options types', () => {
      // Arrange
      const conversationId = 'CONVERSATION_ID';
      const dummyActionBodies = createFakeOptions(conversationId);
      dummyActionBodies.forEach((option) => {
        it(`should find Option type for ${option.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(option);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.Options);
          assert(typeAndConversation.conversationId === conversationId);
        });
      });
    });
    describe('action types', () => {
      // Arrange
      const conversationId = 'CONVERSATION_ID';
      const dummyActionBodies = createFakeActions(conversationId);
      dummyActionBodies.forEach((action) => {
        it(`should find Action type for ${action.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(action);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.Action);
          assert(typeAndConversation.conversationId === conversationId);
        });
      });
    });
    describe('shortcut types', () => {
      // Arrange
      const conversationId = 'CONVERSATION_ID';
      const dummyShortcutBodies = createFakeShortcuts(conversationId);
      dummyShortcutBodies.forEach((shortcut) => {
        it(`should find Shortcut type for ${shortcut.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(shortcut);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.Shortcut);
          if (typeAndConversation.conversationId != null) {
            assert(typeAndConversation.conversationId === conversationId);
          }
        });
      });
    });
    describe('view types', () => {
      // Arrange
      const dummyViewBodies = createFakeViews();
      dummyViewBodies.forEach((viewBody) => {
        it(`should find Action type for ${viewBody.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(viewBody);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.ViewAction);
        });
      });
    });
    describe('invalid events', () => {
      // Arrange
      const fakeEventBody = {
        fake: 'THIS_IS_FAKE',
        channel: { id: 'FAKE_CONVERSATION_ID' },
      };

      it('should not find type for invalid event', () => {
        // Act
        const typeAndConversation = getTypeAndConversation(fakeEventBody);

        // Assert
        assert.isEmpty(typeAndConversation);
      });
    });
  });
});

function createFakeActions(conversationId: string): any[] {
  return [
    // Body for a dialog submission
    {
      type: 'dialog_submission',
      channel: { id: conversationId },
    },
    // Body for an action within an interactive message
    {
      type: 'interactive_message',
      channel: { id: conversationId },
      actions: [
        {
          type: 'button',
        },
      ],
    },
    // Body for an action within a block
    {
      type: 'block_actions',
      channel: { id: conversationId },
      actions: [
        {
          type: 'static_select',
        },
      ],
    },
  ];
}

function createFakeShortcuts(conversationId: string): any[] {
  return [
    // Body for a message shortcut
    {
      type: 'message_action',
      channel: { id: conversationId },
    },
    // Body for a global shortcut
    {
      type: 'shortcut',
    },
  ];
}

function createFakeOptions(conversationId: string): any[] {
  return [
    // Body for an options request in an interactive message
    {
      type: 'interactive_message',
      channel: { id: conversationId },
      name: 'OPTIONS_NAME',
    },
    // Body for an options request in a dialog
    {
      type: 'dialog_suggestion',
      channel: { id: conversationId },
      name: 'OPTIONS_NAME',
    },
    // Body for an action within a block
    {
      type: 'block_suggestion',
      channel: { id: conversationId },
    },
  ];
}

function createFakeViews(): any[] {
  return [
    // Body for a view_submission event
    {
      type: 'view_submission',
      view: { id: 'V123' },
    },
    // Body for a view_closed event
    {
      type: 'view_closed',
      view: { id: 'V456' },
    },
  ];
}
