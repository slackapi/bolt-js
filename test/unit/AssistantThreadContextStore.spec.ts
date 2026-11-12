import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import type { WebClient } from '@slack/web-api';
import { extractThreadInfo } from '../../src/Assistant';
import { DefaultThreadContextStore } from '../../src/AssistantThreadContextStore';
import { createDummyAssistantThreadStartedEventMiddlewareArgs, wrapMiddleware } from './helpers';

describe('DefaultThreadContextStore class', () => {
  describe('get', () => {
    it('should retrieve message metadata if context not already saved to instance', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const botUserId = 'U1234';
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs(), {
        botUserId,
        isEnterpriseInstall: false,
      });
      const mockThreadContext = { channel_id: '123', thread_ts: '123', enterprise_id: null };
      const fakeClient = {
        conversations: {
          replies: mock.fn(() => ({
            messages: [
              {
                user: botUserId,
                ts: '12345',
                metadata: { event_payload: mockThreadContext },
              },
            ],
          })),
        },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      assert.ok(fakeClient.conversations.replies.mock.callCount() > 0);
      assert.equal(threadContext, mockThreadContext);
    });

    it('should return an empty object if no message history exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = { conversations: { replies: mock.fn(() => []) } };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      assert.strictEqual(Object.keys(threadContext).length, 0);
    });

    it('should return an empty object if no message metadata exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: {
          replies: mock.fn(() => ({
            messages: [
              {
                user: 'U12345',
                ts: '12345',
                metadata: {},
              },
            ],
          })),
        },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      assert.strictEqual(Object.keys(threadContext).length, 0);
    });

    it('should retrieve instance context if it has been saved previously', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: mock.fn(() => ({ messages: [{ user: 'U12345', ts: '12345' }] })) },
        chat: { update: mock.fn() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      assert.strictEqual(fakeClient.conversations.replies.mock.callCount(), 1);
      assert.equal(threadContext, mockThreadStartedArgs.payload.assistant_thread.context);
    });
  });

  describe('save', () => {
    it('should update instance context with threadContext', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: mock.fn(() => ({ messages: [] })) },
        chat: { update: mock.fn() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      const instanceContext = await mockContextStore.get(mockThreadStartedArgs);

      assert.ok(fakeClient.conversations.replies.mock.callCount() > 0);
      assert.deepEqual(instanceContext, mockThreadStartedArgs.payload.assistant_thread.context);
    });

    it('should retrieve message history', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: mock.fn(() => ({})) },
        chat: { update: mock.fn() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      assert.strictEqual(fakeClient.conversations.replies.mock.callCount(), 1);
    });

    it('should return early if no message history exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: mock.fn(() => ({})) },
        chat: { update: mock.fn() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      assert.strictEqual(fakeClient.chat.update.mock.callCount(), 0);
    });

    it('should update first bot message metadata with threadContext', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const botUserId = 'U1234';
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs(), {
        botUserId,
        isEnterpriseInstall: false,
      });
      const fakeClient = {
        conversations: { replies: mock.fn(() => ({ messages: [{ user: botUserId, ts: '12345', text: 'foo' }] })) },
        chat: { update: mock.fn() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const { channelId, context } = extractThreadInfo(mockThreadStartedArgs.payload);
      const mockParams = {
        channel: channelId,
        ts: '12345',
        text: 'foo',
        blocks: [],
        metadata: {
          event_type: 'assistant_thread_context',
          event_payload: context,
        },
      };

      await mockContextStore.save(mockThreadStartedArgs);
      assert.deepStrictEqual(fakeClient.chat.update.mock.calls[0].arguments, [mockParams]);
    });
  });
});
