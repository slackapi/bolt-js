import type { WebClient } from '@slack/web-api';
import { assert } from 'chai';
import sinon from 'sinon';
import { extractThreadInfo } from '../../src/Assistant';
import { DefaultThreadContextStore } from '../../src/AssistantThreadContextStore';
import { createDummyAssistantThreadStartedEventMiddlewareArgs, wrapMiddleware } from './helpers';

describe('DefaultThreadContextStore class', () => {
  describe('get', () => {
    it('should retrieve message metadata if context not already saved to instance', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const mockThreadContext = { channel_id: '123', thread_ts: '123', enterprise_id: null };
      const fakeClient = {
        conversations: {
          replies: sinon.fake.returns({
            messages: [
              {
                user: 'U12345',
                ts: '12345',
                metadata: { event_payload: mockThreadContext },
              },
            ],
          }),
        },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      sinon.assert.called(fakeClient.conversations.replies);
      assert.equal(threadContext, mockThreadContext);
    });

    it('should return an empty object if no message history exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = { conversations: { replies: sinon.fake.returns([]) } };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      assert.isEmpty(threadContext);
    });

    it('should return an empty object if no message metadata exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: {
          replies: sinon.fake.returns({
            messages: [
              {
                user: 'U12345',
                ts: '12345',
                metadata: {},
              },
            ],
          }),
        },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      assert.isEmpty(threadContext);
    });

    it('should retrieve instance context if it has been saved previously', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({ messages: [{ user: 'U12345', ts: '12345' }] }) },
        chat: { update: sinon.fake() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      const threadContext = await mockContextStore.get(mockThreadStartedArgs);

      sinon.assert.calledOnce(fakeClient.conversations.replies);
      assert.equal(threadContext, mockThreadStartedArgs.payload.assistant_thread.context);
    });
  });

  describe('save', () => {
    it('should update instance context with threadContext', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({ messages: [] }) },
        chat: { update: sinon.fake() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      const instanceContext = await mockContextStore.get(mockThreadStartedArgs);

      sinon.assert.called(fakeClient.conversations.replies);
      assert.deepEqual(instanceContext, mockThreadStartedArgs.payload.assistant_thread.context);
    });

    it('should retrieve message history', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({}) },
        chat: { update: sinon.fake() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      sinon.assert.calledOnce(fakeClient.conversations.replies);
    });

    it('should return early if no message history exists', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({}) },
        chat: { update: sinon.fake() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;

      await mockContextStore.save(mockThreadStartedArgs);
      sinon.assert.notCalled(fakeClient.chat.update);
    });

    it('should update first bot message metadata with threadContext', async () => {
      const mockContextStore = new DefaultThreadContextStore();
      const mockThreadStartedArgs = wrapMiddleware(createDummyAssistantThreadStartedEventMiddlewareArgs());
      const fakeClient = {
        conversations: { replies: sinon.fake.returns({ messages: [{ user: 'U12345', ts: '12345', text: 'foo' }] }) },
        chat: { update: sinon.fake() },
      };
      mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
      const { channelId, context } = extractThreadInfo(mockThreadStartedArgs.payload);
      const mockParams = {
        channel: channelId,
        ts: '12345',
        text: 'foo',
        metadata: {
          event_type: 'assistant_thread_context',
          event_payload: context,
        },
      };

      await mockContextStore.save(mockThreadStartedArgs);
      sinon.assert.calledWith(fakeClient.chat.update, mockParams);
    });
  });
});
