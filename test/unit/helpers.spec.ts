import { assert } from 'chai';
import {
  IncomingEventType,
  getTypeAndConversation,
  isBodyWithTypeEnterpriseInstall,
  isEventTypeToSkipAuthorize,
} from '../../src/helpers';
import type { AnyMiddlewareArgs, ReceiverEvent, SlackEventMiddlewareArgs } from '../../src/types';

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
      for (const option of dummyActionBodies) {
        it(`should find Option type for ${option.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(option);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.Options);
          assert(typeAndConversation.conversationId === conversationId);
        });
      }
    });
    describe('action types', () => {
      // Arrange
      const conversationId = 'CONVERSATION_ID';
      const dummyActionBodies = createFakeActions(conversationId);
      for (const action of dummyActionBodies) {
        it(`should find Action type for ${action.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(action);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.Action);
          assert(typeAndConversation.conversationId === conversationId);
        });
      }
    });
    describe('shortcut types', () => {
      // Arrange
      const conversationId = 'CONVERSATION_ID';
      const dummyShortcutBodies = createFakeShortcuts(conversationId);
      for (const shortcut of dummyShortcutBodies) {
        it(`should find Shortcut type for ${shortcut.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(shortcut);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.Shortcut);
          if (typeAndConversation.conversationId != null) {
            assert(typeAndConversation.conversationId === conversationId);
          }
        });
      }
    });
    describe('view types', () => {
      // Arrange
      const dummyViewBodies = createFakeViews();
      for (const viewBody of dummyViewBodies) {
        it(`should find Action type for ${viewBody.type}`, () => {
          // Act
          const typeAndConversation = getTypeAndConversation(viewBody);
          // Assert
          assert(typeAndConversation.type === IncomingEventType.ViewAction);
        });
      }
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

  describe(`${isBodyWithTypeEnterpriseInstall.name}()`, () => {
    describe('with body of event type', () => {
      // Arrange
      const dummyEventBody: SlackEventMiddlewareArgs['body'] = {
        token: '',
        team_id: '',
        api_app_id: '',
        event_id: '',
        event_time: 0,
        type: 'event_callback',
        event: {
          type: 'app_home_opened',
          user: '',
          channel: '',
          event_ts: '',
        },
        authorizations: [
          {
            enterprise_id: '',
            is_bot: true,
            team_id: '',
            user_id: '',
            is_enterprise_install: true,
          },
        ],
      };

      it('should resolve the is_enterprise_install field', () => {
        // Act
        const isEnterpriseInstall = isBodyWithTypeEnterpriseInstall(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === true);
      });

      it('should resolve the is_enterprise_install with provided event type', () => {
        // Act
        const isEnterpriseInstall = isBodyWithTypeEnterpriseInstall(dummyEventBody, IncomingEventType.Event);
        // Assert
        assert(isEnterpriseInstall === true);
      });
    });

    describe('with is_enterprise_install as a string value', () => {
      // Arrange
      const dummyEventBody = {
        is_enterprise_install: 'true',
      } as AnyMiddlewareArgs['body'];

      it('should resolve is_enterprise_install as truthy', () => {
        // Act
        const isEnterpriseInstall = isBodyWithTypeEnterpriseInstall(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === true);
      });
    });

    describe('with is_enterprise_install as boolean value', () => {
      // Arrange
      const dummyEventBody = {
        is_enterprise_install: true,
      } as AnyMiddlewareArgs['body'];

      it('should resolve is_enterprise_install as truthy', () => {
        // Act
        const isEnterpriseInstall = isBodyWithTypeEnterpriseInstall(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === true);
      });
    });

    describe('with is_enterprise_install undefined', () => {
      // Arrange
      const dummyEventBody = {} as AnyMiddlewareArgs['body'];

      it('should resolve is_enterprise_install as falsy', () => {
        // Act
        const isEnterpriseInstall = isBodyWithTypeEnterpriseInstall(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === false);
      });
    });
  });

  describe(`${isEventTypeToSkipAuthorize.name}()`, () => {
    describe('receiver events that can be skipped', () => {
      it('should return truthy when event can be skipped', () => {
        // Arrange
        const dummyEventBody = { ack: async () => { }, body: { event: { type: 'app_uninstalled' } } } as ReceiverEvent;
        // Act
        const isEnterpriseInstall = isEventTypeToSkipAuthorize(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === true);
      });

      it('should return falsy when event can not be skipped', () => {
        // Arrange
        const dummyEventBody = { ack: async () => { }, body: { event: { type: '' } } } as ReceiverEvent;
        // Act
        const isEnterpriseInstall = isEventTypeToSkipAuthorize(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === false);
      });

      it('should return falsy when event is invalid', () => {
        // Arrange
        const dummyEventBody = { ack: async () => { }, body: {} } as ReceiverEvent;
        // Act
        const isEnterpriseInstall = isEventTypeToSkipAuthorize(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === false);
      });
    });
  });
});

// biome-ignore lint/suspicious/noExplicitAny: test utilities can return anything
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

// biome-ignore lint/suspicious/noExplicitAny: test utilities can return anything
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

// biome-ignore lint/suspicious/noExplicitAny: test utilities can return anything
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

// biome-ignore lint/suspicious/noExplicitAny: test utilities can return anything
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
