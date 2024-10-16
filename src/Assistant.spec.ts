import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import rewiremock from 'rewiremock';
import { WebClient } from '@slack/web-api';
import {
  Assistant,
  AssistantMiddlewareArgs,
  AllAssistantMiddlewareArgs,
  AssistantMiddleware,
  AssistantConfig,
  AssistantThreadStartedMiddlewareArgs,
  AssistantThreadContextChangedMiddlewareArgs,
  AssistantUserMessageMiddlewareArgs,
} from './Assistant';
import { Override } from './test-helpers';
import { AllMiddlewareArgs, AnyMiddlewareArgs, AssistantThreadStartedEvent, Middleware, SlackEventMiddlewareArgs } from './types';
import { AssistantInitializationError, AssistantMissingPropertyError } from './errors';
import { AssistantThreadContextStore, AssistantThreadContext } from './AssistantThreadContextStore';

async function importAssistant(overrides: Override = {}): Promise<typeof import('./Assistant')> {
  return rewiremock.module(() => import('./Assistant'), overrides);
}

const MOCK_FN = async () => { };

const MOCK_CONFIG_SINGLE = {
  threadStarted: MOCK_FN,
  threadContextChanged: MOCK_FN,
  userMessage: MOCK_FN,
};

const MOCK_CONFIG_MULTIPLE = {
  threadStarted: [MOCK_FN, MOCK_FN],
  threadContextChanged: [MOCK_FN],
  userMessage: [MOCK_FN, MOCK_FN, MOCK_FN],
};

describe('Assistant class', () => {
  describe('constructor', () => {
    it('should accept config as single functions', async () => {
      const assistant = new Assistant(MOCK_CONFIG_SINGLE);
      assert.isNotNull(assistant);
    });

    it('should accept config as multiple functions', async () => {
      const assistant = new Assistant(MOCK_CONFIG_MULTIPLE);
      assert.isNotNull(assistant);
    });

    describe('validate', () => {
      it('should throw an error if config is not an object', async () => {
        const { validate } = await importAssistant();

        // intentionally casting to AssistantConfig to trigger failure
        const badConfig = '' as unknown as AssistantConfig;

        const validationFn = () => validate(badConfig);
        const expectedMsg = 'Assistant expects a configuration object as the argument';
        assert.throws(validationFn, AssistantInitializationError, expectedMsg);
      });

      it('should throw an error if required keys are missing', async () => {
        const { validate } = await importAssistant();

        // intentionally casting to AssistantConfig to trigger failure
        const badConfig = {
          threadStarted: async () => { },
        } as unknown as AssistantConfig;

        const validationFn = () => validate(badConfig);
        const expectedMsg = 'Assistant is missing required keys: userMessage';
        assert.throws(validationFn, AssistantInitializationError, expectedMsg);
      });

      it('should throw an error if props are not a single callback or an array of callbacks', async () => {
        const { validate } = await importAssistant();

        // intentionally casting to AssistantConfig to trigger failure
        const badConfig = {
          threadStarted: async () => { },
          threadContextChanged: {},
          userMessage: async () => { },
        } as unknown as AssistantConfig;

        const validationFn = () => validate(badConfig);
        const expectedMsg = 'Assistant threadContextChanged property must be a function or an array of functions';
        assert.throws(validationFn, AssistantInitializationError, expectedMsg);
      });
    });
  });

  describe('getMiddleware', () => {
    it('should call next if not an assistant event', async () => {
      const assistant = new Assistant(MOCK_CONFIG_SINGLE);
      const middleware = assistant.getMiddleware();
      const fakeMessageArgs = createGenericEvent() as unknown as AnyMiddlewareArgs & AllMiddlewareArgs;
      fakeMessageArgs.payload.type = 'app_mention';

      const fakeNext = sinon.spy();
      fakeMessageArgs.next = fakeNext;

      await middleware(fakeMessageArgs);

      assert(fakeNext.called);
    });

    it('should not call next if a assistant event', async () => {
      const assistant = new Assistant(MOCK_CONFIG_SINGLE);
      const middleware = assistant.getMiddleware();
      const mockThreadStartedArgs = createMockThreadStartedEvent() as
        unknown as AnyMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      mockThreadStartedArgs.next = fakeNext;

      await middleware(mockThreadStartedArgs);

      assert(fakeNext.notCalled);
    });

    describe('isAssistantEvent', () => {
      it('should return true if recognized assistant event', async () => {
        const mockThreadStartedArgs = createMockThreadStartedEvent() as
          unknown as AnyMiddlewareArgs;
        const mockThreadContextChangedArgs = createMockThreadContextChangedEvent() as
          unknown as AnyMiddlewareArgs;
        const mockUserMessageArgs = createMockUserMessageEvent() as
          unknown as AnyMiddlewareArgs;

        const { isAssistantEvent } = await importAssistant();

        const threadStartedIsAssistantEvent = isAssistantEvent(mockThreadStartedArgs);
        const threadContextChangedIsAssistantEvent = isAssistantEvent(mockThreadContextChangedArgs);
        const userMessageIsAssistantEvent = isAssistantEvent(mockUserMessageArgs);

        assert.isTrue(threadStartedIsAssistantEvent);
        assert.isTrue(threadContextChangedIsAssistantEvent);
        assert.isTrue(userMessageIsAssistantEvent);
      });

      it('should return false if not a recognized assistant event', async () => {
        const fakeEventArgs = createGenericEvent() as unknown as SlackEventMiddlewareArgs;
        fakeEventArgs.payload.type = 'function_executed';

        const { isAssistantEvent } = await importAssistant();
        const messageIsAssistantEvent = isAssistantEvent(fakeEventArgs as AnyMiddlewareArgs);

        assert.isFalse(messageIsAssistantEvent);
      });
    });

    describe('matchesConstraints', () => {
      it('should return true if recognized assistant message', async () => {
        const mockUserMessageArgs = createMockUserMessageEvent() as unknown as AssistantMiddlewareArgs;
        const { matchesConstraints } = await importAssistant();
        const eventMatchesConstraints = matchesConstraints(mockUserMessageArgs);

        assert.isTrue(eventMatchesConstraints);
      });

      it('should return false if not supported message subtype', async () => {
        const mockAppMentionArgs = createGenericEvent() as unknown as any;
        mockAppMentionArgs.payload.type = 'message';
        mockAppMentionArgs.payload.subtype = 'bot_message';

        const { matchesConstraints } = await importAssistant();
        const eventMatchesConstraints = matchesConstraints(mockAppMentionArgs);

        assert.isFalse(eventMatchesConstraints);
      });

      it('should return true if not message event', async () => {
        const assistantThreadStartedArgs = createGenericEvent() as unknown as any;
        assistantThreadStartedArgs.payload.type = 'assistant_thread_started';

        const { matchesConstraints } = await importAssistant();
        const eventMatchesConstraints = matchesConstraints(assistantThreadStartedArgs);

        assert.isTrue(eventMatchesConstraints);
      });

      describe('isAssistantMessage', () => {
        it('should return true if assistant message event', async () => {
          const mockUserMessageArgs = createMockUserMessageEvent() as unknown as any;
          const { isAssistantMessage } = await importAssistant();
          const userMessageIsAssistantEvent = isAssistantMessage(mockUserMessageArgs.payload);

          assert.isTrue(userMessageIsAssistantEvent);
        });

        it('should return false if not correct subtype', async () => {
          const mockAppMentionArgs = createGenericEvent() as unknown as any;
          mockAppMentionArgs.payload.type = 'message';
          mockAppMentionArgs.payload.subtype = 'app_mention';

          const { isAssistantMessage } = await importAssistant();
          const userMessageIsAssistantEvent = isAssistantMessage(mockAppMentionArgs.payload);

          assert.isFalse(userMessageIsAssistantEvent);
        });

        it('should return false if thread_ts is missing', async () => {
          const mockUnsupportedMessageArgs = createMockUserMessageEvent() as unknown as any;
          delete mockUnsupportedMessageArgs.payload.thread_ts;

          const { isAssistantMessage } = await importAssistant();
          const userMessageIsAssistantEvent = isAssistantMessage(mockUnsupportedMessageArgs.payload);

          assert.isFalse(userMessageIsAssistantEvent);
        });

        it('should return false if channel_type is incorrect', async () => {
          const mockUnsupportedMessageArgs = createMockUserMessageEvent() as unknown as any;
          mockUnsupportedMessageArgs.payload.channel_type = 'mpim';

          const { isAssistantMessage } = await importAssistant();
          const userMessageIsAssistantEvent = isAssistantMessage(mockUnsupportedMessageArgs.payload);

          assert.isFalse(userMessageIsAssistantEvent);
        });
      });
    });
  });

  describe('processEvent', () => {
    describe('prepareAssistantArgs', () => {
      it('should remove next() from all original event args', async () => {
        const mockThreadStartedArgs = createMockThreadStartedEvent() as
          unknown as AssistantThreadStartedMiddlewareArgs & AllMiddlewareArgs;
        const mockThreadContextChangedArgs = createMockThreadContextChangedEvent() as
          unknown as AssistantThreadContextChangedMiddlewareArgs & AllMiddlewareArgs;
        const mockUserMessageArgs = createMockUserMessageEvent() as
          unknown as AssistantUserMessageMiddlewareArgs & AllMiddlewareArgs;
        const mockThreadContextStore = createMockThreadContextStore();

        const { prepareAssistantArgs } = await importAssistant();

        const threadStartedArgs = prepareAssistantArgs(mockThreadContextStore, mockThreadStartedArgs);
        const threadContextChangedArgs = prepareAssistantArgs(mockThreadContextStore, mockThreadContextChangedArgs);
        const userMessageArgs = prepareAssistantArgs(mockThreadContextStore, mockUserMessageArgs);

        assert.notExists(threadStartedArgs.next);
        assert.notExists(threadContextChangedArgs.next);
        assert.notExists(userMessageArgs.next);
      });

      it('should augment assistant_thread_started args with utilities', async () => {
        const mockArgs = createMockThreadStartedEvent();
        const mockThreadContextStore = createMockThreadContextStore();
        const { prepareAssistantArgs } = await importAssistant();
        const assistantArgs = prepareAssistantArgs(mockThreadContextStore, mockArgs as any);

        assert.exists(assistantArgs.say);
        assert.exists(assistantArgs.setStatus);
        assert.exists(assistantArgs.setSuggestedPrompts);
        assert.exists(assistantArgs.setTitle);
      });

      it('should augment assistant_thread_context_changed args with utilities', async () => {
        const mockArgs = createMockThreadContextChangedEvent();
        const mockThreadContextStore = createMockThreadContextStore();
        const { prepareAssistantArgs } = await importAssistant();
        const assistantArgs = prepareAssistantArgs(mockThreadContextStore, mockArgs as any);

        assert.exists(assistantArgs.say);
        assert.exists(assistantArgs.setStatus);
        assert.exists(assistantArgs.setSuggestedPrompts);
        assert.exists(assistantArgs.setTitle);
      });

      it('should augment message args with utilities', async () => {
        const mockArgs = createMockUserMessageEvent();
        const mockThreadContextStore = createMockThreadContextStore();
        const { prepareAssistantArgs } = await importAssistant();
        const assistantArgs = prepareAssistantArgs(mockThreadContextStore, mockArgs as any);

        assert.exists(assistantArgs.say);
        assert.exists(assistantArgs.setStatus);
        assert.exists(assistantArgs.setSuggestedPrompts);
        assert.exists(assistantArgs.setTitle);
      });

      describe('extractThreadInfo', () => {
        it('should return expected channelId, threadTs, and context for `assistant_thread_started` event', async () => {
          const mockThreadStartedEvent = createMockThreadStartedEvent() as unknown as AssistantThreadStartedMiddlewareArgs; // eslint-disable-line max-len
          const { payload } = mockThreadStartedEvent;
          const { extractThreadInfo } = await importAssistant();
          const { channelId, threadTs, context } = extractThreadInfo(payload);

          assert.equal(payload.assistant_thread.channel_id, channelId);
          assert.equal(payload.assistant_thread.thread_ts, threadTs);
          assert.deepEqual(payload.assistant_thread.context, context);
        });

        it('should return expected channelId, threadTs, and context for `assistant_thread_context_changed` event', async () => {
          const mockThreadChangedEvent = createMockThreadContextChangedEvent() as unknown as AssistantThreadContextChangedMiddlewareArgs; // eslint-disable-line max-len
          const { payload } = mockThreadChangedEvent;
          const { extractThreadInfo } = await importAssistant();
          const { channelId, threadTs, context } = extractThreadInfo(payload);

          assert.equal(payload.assistant_thread.channel_id, channelId);
          assert.equal(payload.assistant_thread.thread_ts, threadTs);
          assert.deepEqual(payload.assistant_thread.context, context);
        });

        it('should return expected channelId and threadTs for `message` event', async () => {
          const mockUserMessageEvent = createMockUserMessageEvent();
          const { payload } = mockUserMessageEvent as any;
          const { extractThreadInfo } = await importAssistant();
          const { channelId, threadTs, context } = extractThreadInfo(payload);

          assert.equal(payload.channel, channelId);
          assert.equal(payload.thread_ts, threadTs);
          assert.isEmpty(context);
        });

        it('should throw error if `channel_id` or `thread_ts` are missing', async () => {
          const { payload } = createMockThreadStartedEvent() as unknown as AssistantThreadStartedMiddlewareArgs; // eslint-disable-line max-len
          payload.assistant_thread.channel_id = '';
          const { extractThreadInfo } = await importAssistant();

          const extractThreadInfoFn = () => extractThreadInfo(payload);
          const expectedMsg = 'Assistant message event is missing required properties: channel_id';
          assert.throws(extractThreadInfoFn, AssistantMissingPropertyError, expectedMsg);
        });
      });

      describe('assistant args/utilities', () => {
        it('say should call chat.postMessage', async () => {
          const mockThreadStartedArgs = createMockThreadStartedEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs; // eslint-disable-line max-len

          const fakeClient = { chat: { postMessage: sinon.spy() } };
          mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
          const mockThreadContextStore = createMockThreadContextStore();

          const { prepareAssistantArgs } = await importAssistant();
          const threadStartedArgs = prepareAssistantArgs(mockThreadContextStore, mockThreadStartedArgs);

          await threadStartedArgs.say('Say called!');

          assert(fakeClient.chat.postMessage.called);
        });

        it('setStatus should call assistant.threads.setStatus', async () => {
          const mockThreadStartedArgs = createMockThreadStartedEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs; // eslint-disable-line max-len

          const fakeClient = { assistant: { threads: { setStatus: sinon.spy() } } };
          mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
          const mockThreadContextStore = createMockThreadContextStore();

          const { prepareAssistantArgs } = await importAssistant();
          const threadStartedArgs = prepareAssistantArgs(mockThreadContextStore, mockThreadStartedArgs);

          await threadStartedArgs.setStatus('Status set!');

          assert(fakeClient.assistant.threads.setStatus.called);
        });

        it('setSuggestedPrompts should call assistant.threads.setSuggestedPrompts', async () => {
          const mockThreadStartedArgs = createMockThreadStartedEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs; // eslint-disable-line max-len

          const fakeClient = { assistant: { threads: { setSuggestedPrompts: sinon.spy() } } };
          mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
          const mockThreadContextStore = createMockThreadContextStore();

          const { prepareAssistantArgs } = await importAssistant();
          const threadStartedArgs = prepareAssistantArgs(mockThreadContextStore, mockThreadStartedArgs);

          await threadStartedArgs.setSuggestedPrompts({ prompts: [{ title: '', message: '' }] });

          assert(fakeClient.assistant.threads.setSuggestedPrompts.called);
        });

        it('setTitle should call assistant.threads.setTitle', async () => {
          const mockThreadStartedArgs = createMockThreadStartedEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs; // eslint-disable-line max-len

          const fakeClient = { assistant: { threads: { setTitle: sinon.spy() } } };
          mockThreadStartedArgs.client = fakeClient as unknown as WebClient;
          const mockThreadContextStore = createMockThreadContextStore();

          const { prepareAssistantArgs } = await importAssistant();
          const threadStartedArgs = prepareAssistantArgs(mockThreadContextStore, mockThreadStartedArgs);

          await threadStartedArgs.setTitle('Title set!');

          assert(fakeClient.assistant.threads.setTitle.called);
        });
      });
    });

    describe('processAssistantMiddleware', () => {
      it('should call each callback in user-provided middleware', async () => {
        const { ...mockArgs } = createMockThreadContextChangedEvent() as unknown as AllAssistantMiddlewareArgs;
        const { processAssistantMiddleware } = await importAssistant();

        const fn1 = sinon.spy((async ({ next: continuation }) => {
          await continuation();
        }) as Middleware<AssistantThreadStartedEvent>);
        const fn2 = sinon.spy(async () => { });
        const fakeMiddleware = [fn1, fn2] as AssistantMiddleware;

        await processAssistantMiddleware(mockArgs, fakeMiddleware);

        assert(fn1.called);
        assert(fn2.called);
      });
    });
  });
});

function createMockThreadStartedEvent() {
  return {
    payload: {
      type: 'assistant_thread_started',
      assistant_thread: {
        user_id: '',
        context: {
          channel_id: '',
          team_id: '',
          enterprise_id: '',
        },
        channel_id: 'D01234567AR',
        thread_ts: '1234567890.123456',
      },
      event_ts: '',
    },
    context: {},
  };
}

function createMockThreadContextChangedEvent() {
  return {
    payload: {
      type: 'assistant_thread_context_changed',
      assistant_thread: {
        user_id: '',
        context: {
          channel_id: '',
          team_id: '',
          enterprise_id: '',
        },
        channel_id: 'D01234567AR',
        thread_ts: '1234567890.123456',
      },
      event_ts: '',
    },
    context: {},
  };
}

function createMockUserMessageEvent() {
  return {
    payload: {
      user: '',
      type: 'message',
      ts: '',
      text: 'test',
      team: '',
      user_team: '',
      source_team: '',
      user_profile: {},
      thread_ts: '1234567890.123456',
      parent_user_id: '',
      blocks: [],
      channel: 'D01234567AR',
      event_ts: '',
      channel_type: 'im',
    },
    context: {},
  };
}

function createGenericEvent() {
  return {
    payload: {
      type: '',
    },
    context: {},
  };
}

function createMockThreadContextStore(): AssistantThreadContextStore {
  return {
    async get(_: AllAssistantMiddlewareArgs): Promise<AssistantThreadContext> {
      return {};
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async save(_: AllAssistantMiddlewareArgs): Promise<void> {
    },
  };
}
