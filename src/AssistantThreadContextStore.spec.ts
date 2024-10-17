import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import { WebClient } from '@slack/web-api';
import { DefaultThreadContextStore } from './AssistantThreadContextStore';
import { AllAssistantMiddlewareArgs, extractThreadInfo } from './Assistant';

describe('DefaultThreadContextStore class', () => {
  describe('get', () => {
    it('should retrieve message metadata if context not already saved to instance', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as unknown as AllAssistantMiddlewareArgs;
      const mockThreadContext = { channel_id: '123', thread_ts: '123', enterprise_id: null };
      const fakeClient = {
        conversations: {
          replies: sinon.fake.returns({
            messages: [{
              user: 'U12345',
              ts: '12345',
              metadata: { event_payload: mockThreadContext },
            }],
          }),
        },
      };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockAssistantMiddlewareArgs);

      assert(fakeClient.conversations.replies.called);
      assert.equal(threadContext, mockThreadContext);
    });

    it('should return an empty object if no message history exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as unknown as AllAssistantMiddlewareArgs;
      const fakeClient = { conversations: { replies: sinon.fake.returns([]) } };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockAssistantMiddlewareArgs);

      assert.isEmpty(threadContext);
    });

    it('should return an empty object if no message metadata exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as unknown as AllAssistantMiddlewareArgs;
      const fakeClient = {
        conversations: {
          replies: sinon.fake.returns({
            messages: [{
              user: 'U12345',
              ts: '12345',
              metadata: {},
            }],
          }),
        },
      };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockAssistantMiddlewareArgs);

      assert.isEmpty(threadContext);
    });

    it('should retrieve instance context if it has been saved previously', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as any;
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({ messages: [{ user: 'U12345', ts: '12345' }] }) },
        chat: { update: sinon.fake() },
      };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockAssistantMiddlewareArgs);
      const threadContext = await mockContextStore.get(mockAssistantMiddlewareArgs);

      assert(fakeClient.conversations.replies.calledOnce);
      assert.equal(threadContext, mockAssistantMiddlewareArgs.payload.assistant_thread.context);
    });
  });

  describe('save', () => {
    it('should update instance context with threadContext', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as any;
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({ messages: [] }) },
        chat: { update: sinon.fake() },
      };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockAssistantMiddlewareArgs);
      const instanceContext = await mockContextStore.get(mockAssistantMiddlewareArgs);

      assert(fakeClient.conversations.replies.calledOnce);
      assert.deepEqual(instanceContext, mockAssistantMiddlewareArgs.payload.assistant_thread.context);
    });

    it('should retrieve message history', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as any;
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({}) },
        chat: { update: sinon.fake() },
      };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockAssistantMiddlewareArgs);
      assert(fakeClient.conversations.replies.calledOnce);
    });

    it('should return early if no message history exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as any;
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({}) },
        chat: { update: sinon.fake() },
      };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockAssistantMiddlewareArgs);
      assert(fakeClient.chat.update.notCalled);
    });

    it('should update first bot message metadata with threadContext', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockAssistantMiddlewareArgs = createMockAssistantMiddlewareArgs() as any;
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({ messages: [{ user: 'U12345', ts: '12345', text: 'foo' }] }) },
        chat: { update: sinon.fake() },
      };
      mockAssistantMiddlewareArgs.client = fakeClient as unknown as WebClient;
      const { channelId, context } = extractThreadInfo(mockAssistantMiddlewareArgs.payload);
      const mockParams = {
        channel: channelId,
        ts: '12345',
        text: 'foo',
        metadata: {
          event_type: 'assistant_thread_context',
          event_payload: context,
        },
      };

      await mockContextStore.save(mockAssistantMiddlewareArgs);
      assert(fakeClient.chat.update.calledWith(mockParams));
    });
  });
});

function createMockAssistantMiddlewareArgs() {
  return {
    client: {},
    logger: {
      debug: sinon.fake(),
    },
    payload: {
      type: 'assistant_thread_started',
      assistant_thread: {
        user_id: '',
        context: {
          channel_id: 'D01234567AR',
          team_id: 'T123',
          enterprise_id: 'E12345678',
        },
        channel_id: 'D01234567AR',
        thread_ts: '1234567890.123456',
      },
      event_ts: '',
    },
    context: {
      botUserId: 'U12345',
    },
  };
}
