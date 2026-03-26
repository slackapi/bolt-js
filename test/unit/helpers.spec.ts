import { assert } from 'chai';
import {
  IncomingEventType,
  extractEventChannelId,
  extractEventThreadTs,
  getTypeAndConversation,
  hasStringProperty,
  isBodyWithTypeEnterpriseInstall,
  isEventTypeToSkipAuthorize,
  isRecord,
} from '../../src/helpers';
import type { AnyMiddlewareArgs, KnownEventFromType, ReceiverEvent, SlackEventMiddlewareArgs } from '../../src/types';

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
        const dummyEventBody = { ack: async () => {}, body: { event: { type: 'app_uninstalled' } } } as ReceiverEvent;
        // Act
        const isEnterpriseInstall = isEventTypeToSkipAuthorize(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === true);
      });

      it('should return falsy when event can not be skipped', () => {
        // Arrange
        const dummyEventBody = { ack: async () => {}, body: { event: { type: '' } } } as ReceiverEvent;
        // Act
        const isEnterpriseInstall = isEventTypeToSkipAuthorize(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === false);
      });

      it('should return falsy when event is invalid', () => {
        // Arrange
        const dummyEventBody = { ack: async () => {}, body: {} } as ReceiverEvent;
        // Act
        const isEnterpriseInstall = isEventTypeToSkipAuthorize(dummyEventBody);
        // Assert
        assert(isEnterpriseInstall === false);
      });
    });
  });
  describe(`${isRecord.name}()`, () => {
    it('should return true for plain objects', () => {
      assert.isTrue(isRecord({}));
      assert.isTrue(isRecord({ key: 'value' }));
    });

    it('should return true for arrays', () => {
      assert.isTrue(isRecord([]));
    });

    it('should return false for null', () => {
      assert.isFalse(isRecord(null));
    });

    it('should return false for undefined', () => {
      assert.isFalse(isRecord(undefined));
    });

    it('should return false for primitives', () => {
      assert.isFalse(isRecord('string'));
      assert.isFalse(isRecord(42));
      assert.isFalse(isRecord(true));
    });
  });

  describe(`${hasStringProperty.name}()`, () => {
    it('should return true when key exists with a string value', () => {
      assert.isTrue(hasStringProperty({ name: 'test' }, 'name'));
    });

    it('should return false when key exists with a non-string value', () => {
      assert.isFalse(hasStringProperty({ count: 42 }, 'count'));
      assert.isFalse(hasStringProperty({ flag: true }, 'flag'));
      assert.isFalse(hasStringProperty({ nested: {} }, 'nested'));
    });

    it('should return false when key does not exist', () => {
      assert.isFalse(hasStringProperty({ other: 'value' }, 'missing'));
    });

    it('should return false for null or undefined input', () => {
      assert.isFalse(hasStringProperty(null, 'key'));
      assert.isFalse(hasStringProperty(undefined, 'key'));
    });
  });

  describe(`${extractEventThreadTs.name}()`, () => {
    const threadTsEvents = [
      { name: 'app_mention with thread_ts', event: { type: 'app_mention', thread_ts: '123.456' } },
      { name: 'message with thread_ts', event: { type: 'message', thread_ts: '123.456' } },
      {
        name: 'bot_message in thread',
        event: { type: 'message', subtype: 'bot_message', thread_ts: '123.456' },
      },
      {
        name: 'file_share in thread',
        event: { type: 'message', subtype: 'file_share', thread_ts: '123.456' },
      },
      {
        name: 'thread_broadcast',
        event: { type: 'message', subtype: 'thread_broadcast', thread_ts: '123.456' },
      },
      { name: 'link_shared with thread_ts', event: { type: 'link_shared', thread_ts: '123.456' } },
      {
        name: 'message_changed with thread_ts in message',
        event: { type: 'message', subtype: 'message_changed', message: { thread_ts: '123.456' } },
      },
      {
        name: 'message_deleted with thread_ts in previous_message',
        event: { type: 'message', subtype: 'message_deleted', previous_message: { thread_ts: '123.456' } },
      },
      {
        name: 'assistant_thread_started',
        event: { type: 'assistant_thread_started', assistant_thread: { thread_ts: '123.456' } },
      },
      {
        name: 'assistant_thread_context_changed',
        event: { type: 'assistant_thread_context_changed', assistant_thread: { thread_ts: '123.456' } },
      },
    ];

    for (const { name, event } of threadTsEvents) {
      it(`should extract thread_ts from ${name}`, () => {
        assert.equal(extractEventThreadTs(event as KnownEventFromType<string>), '123.456');
      });
    }

    const noThreadTsEvents = [
      { name: 'reaction_added', event: { type: 'reaction_added', item: { channel: 'C1234' } } },
      { name: 'channel_created', event: { type: 'channel_created', channel: { id: 'C1234' } } },
      { name: 'message without thread_ts', event: { type: 'message', ts: '111.222' } },
    ];

    for (const { name, event } of noThreadTsEvents) {
      it(`should return undefined for ${name}`, () => {
        assert.isUndefined(extractEventThreadTs(event as KnownEventFromType<string>));
      });
    }
  });

  describe(`${extractEventChannelId.name}()`, () => {
    const channelEvents = [
      { name: 'message with channel', event: { type: 'message', channel: 'C1234' } },
      { name: 'app_mention with channel', event: { type: 'app_mention', channel: 'C1234' } },
      { name: 'member_joined_channel', event: { type: 'member_joined_channel', channel: 'C1234' } },
      {
        name: 'channel_created with channel object',
        event: { type: 'channel_created', channel: { id: 'C1234', name: 'general' } },
      },
      {
        name: 'channel_archive with channel object',
        event: { type: 'channel_archive', channel: { id: 'C1234' } },
      },
      { name: 'event with channel_id', event: { type: 'some_event', channel_id: 'C1234' } },
      {
        name: 'reaction_added with item.channel',
        event: { type: 'reaction_added', item: { channel: 'C1234', ts: '111.222' } },
      },
      { name: 'pin_added with item.channel', event: { type: 'pin_added', item: { channel: 'C1234' } } },
      {
        name: 'assistant_thread_started',
        event: { type: 'assistant_thread_started', assistant_thread: { channel_id: 'C1234', thread_ts: '123.456' } },
      },
      {
        name: 'assistant_thread_context_changed',
        event: {
          type: 'assistant_thread_context_changed',
          assistant_thread: { channel_id: 'C1234', thread_ts: '123.456' },
        },
      },
    ];

    for (const { name, event } of channelEvents) {
      it(`should extract channel from ${name}`, () => {
        assert.equal(extractEventChannelId(event as KnownEventFromType<string>), 'C1234');
      });
    }

    const noChannelEvents = [
      { name: 'tokens_revoked', event: { type: 'tokens_revoked' } },
      { name: 'team_join', event: { type: 'team_join', user: { id: 'U1234' } } },
      { name: 'app_home_opened without channel', event: { type: 'app_home_opened', user: 'U1234' } },
    ];

    for (const { name, event } of noChannelEvents) {
      it(`should return undefined for ${name}`, () => {
        assert.isUndefined(extractEventChannelId(event as KnownEventFromType<string>));
      });
    }

    it('should prefer channel over channel_id when both exist', () => {
      const event = { type: 'some_event', channel: 'C_FROM_CHANNEL', channel_id: 'C_FROM_CHANNEL_ID' };
      assert.equal(extractEventChannelId(event as KnownEventFromType<string>), 'C_FROM_CHANNEL');
    });

    it('should extract channel.id from object when channel is not a string', () => {
      const event = { type: 'some_event', channel: { id: 'C_FROM_OBJ' }, channel_id: 'C_FROM_CHANNEL_ID' };
      assert.equal(extractEventChannelId(event as KnownEventFromType<string>), 'C_FROM_OBJ');
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
