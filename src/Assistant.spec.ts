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
import { AllMiddlewareArgs, AnyMiddlewareArgs, AssistantThreadStartedEvent, Middleware } from './types';
import { AssistantInitializationError } from './errors';

async function importAssistant(overrides: Override = {}): Promise<typeof import('./Assistant')> {
  return rewiremock.module(() => import('./Assistant'), overrides);
}

const MOCK_FN = async () => {};

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
  });

  describe('getMiddleware', () => {
    it('should not call next if a assistant event', async () => {
      const assistant = new Assistant(MOCK_CONFIG_SINGLE);
      const middleware = assistant.getMiddleware();
      const fakeThreadStartedArgs = createFakeThreadStartedEvent() as
        unknown as AssistantMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeThreadStartedArgs.next = fakeNext;

      await middleware(fakeThreadStartedArgs);

      assert(fakeNext.notCalled);
    });

    it('should call next if not an assistant event', async () => {
      const assistant = new Assistant(MOCK_CONFIG_SINGLE);
      const middleware = assistant.getMiddleware();
      const fakeMessageEvent = createFakeMessageEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs;

      const fakeNext = sinon.spy();
      fakeMessageEvent.next = fakeNext;

      await middleware(fakeMessageEvent);

      assert(fakeNext.called);
    });
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
        threadStarted: async () => {},
      } as unknown as AssistantConfig;

      const validationFn = () => validate(badConfig);
      const expectedMsg = 'Assistant is missing required keys: threadContextChanged, userMessage';
      assert.throws(validationFn, AssistantInitializationError, expectedMsg);
    });

    it('should throw an error if props are not a single callback or an array of callbacks', async () => {
      const { validate } = await importAssistant();

      // intentionally casting to AssistantConfig to trigger failure
      const badConfig = {
        threadStarted: async () => {},
        threadContextChanged: {},
        userMessage: async () => {},
      } as unknown as AssistantConfig;

      const validationFn = () => validate(badConfig);
      const expectedMsg = 'Assistant threadContextChanged property must be a function or an array of functions';
      assert.throws(validationFn, AssistantInitializationError, expectedMsg);
    });
  });

  describe('isAssistantEvent', () => {
    it('should return true if recognized assistant payload type', async () => {
      const fakeThreadStartedArgs = createFakeThreadStartedEvent() as
        unknown as AssistantThreadStartedMiddlewareArgs & AllMiddlewareArgs;
      const fakeThreadContextChangedArgs = createFakeThreadContextChangedEvent() as
        unknown as AssistantThreadContextChangedMiddlewareArgs & AllMiddlewareArgs;
      const fakeUserMessageArgs = createFakeUserMessageEvent() as
        unknown as AssistantUserMessageMiddlewareArgs & AllMiddlewareArgs;

      const { isAssistantEvent } = await importAssistant();

      const threadStartedIsAssistantEvent = isAssistantEvent(fakeThreadStartedArgs);
      const threadContextChangedIsAssistantEvent = isAssistantEvent(fakeThreadContextChangedArgs);
      const userMessageIsAssistantEvent = isAssistantEvent(fakeUserMessageArgs);

      assert.isTrue(threadStartedIsAssistantEvent);
      assert.isTrue(threadContextChangedIsAssistantEvent);
      assert.isTrue(userMessageIsAssistantEvent);
    });

    it('should return false if not a recognized workflow step payload type', async () => {
      const fakeMessageArgs = createFakeUserMessageEvent() as unknown as AnyMiddlewareArgs;
      fakeMessageArgs.payload.type = 'message';
      fakeMessageArgs.payload.subtype = 'bot';

      const { isAssistantEvent } = await importAssistant();
      const messageIsAssistantEvent = isAssistantEvent(fakeMessageArgs);

      assert.isFalse(messageIsAssistantEvent);
    });
  });

  describe('prepareAssistantArgs', () => {
    it('should remove next() from all original event args', async () => {
      const fakeThreadStartedArgs = createFakeThreadStartedEvent() as
        unknown as AssistantThreadStartedMiddlewareArgs & AllMiddlewareArgs;
      const fakeThreadContextChangedArgs = createFakeThreadContextChangedEvent() as
        unknown as AssistantThreadContextChangedMiddlewareArgs & AllMiddlewareArgs;
      const fakeUserMessageArgs = createFakeUserMessageEvent() as
        unknown as AssistantUserMessageMiddlewareArgs & AllMiddlewareArgs;

      const { prepareAssistantArgs } = await importAssistant();

      const threadStartedArgs = prepareAssistantArgs(fakeThreadStartedArgs);
      const threadContextChangedArgs = prepareAssistantArgs(fakeThreadContextChangedArgs);
      const userMessageArgs = prepareAssistantArgs(fakeUserMessageArgs);

      assert.notExists(threadStartedArgs.next);
      assert.notExists(threadContextChangedArgs.next);
      assert.notExists(userMessageArgs.next);
    });

    it('should augment workflow_step_edit args with step and configure()', async () => {
      const fakeArgs = createFakeThreadStartedEvent();
      const { prepareAssistantArgs } = await importAssistant();
      // casting to returned type because prepareAssistantArgs isn't built to do so
      const assistantArgs = prepareAssistantArgs(fakeArgs) as
        AllAssistantMiddlewareArgs<AssistantThreadStartedMiddlewareArgs>;

      assert.exists(assistantArgs.setStatus);
      assert.exists(assistantArgs.setTitle);
      assert.exists(assistantArgs.setSuggestedPrompts);
    });

    it('should augment view_submission with step and update()', async () => {
      const fakeArgs = createFakeThreadContextChangedEvent();
      const { prepareAssistantArgs } = await importAssistant();
      // casting to returned type because prepareAssistantArgs isn't built to do so
      const assistantArgs = prepareAssistantArgs(fakeArgs) as
        AllAssistantMiddlewareArgs<AssistantThreadContextChangedMiddlewareArgs>;

      assert.exists(assistantArgs.setStatus);
      assert.exists(assistantArgs.setTitle);
      assert.exists(assistantArgs.setSuggestedPrompts);
    });

    it('should augment workflow_step_execute with step, complete() and fail()', async () => {
      const fakeArgs = createFakeUserMessageEvent();
      const { prepareAssistantArgs } = await importAssistant();
      // casting to returned type because prepareAssistantArgs isn't built to do so
      const assistantArgs = prepareAssistantArgs(fakeArgs) as
        AllAssistantMiddlewareArgs<AssistantUserMessageMiddlewareArgs>;

      assert.exists(assistantArgs.setStatus);
      assert.exists(assistantArgs.setTitle);
      assert.exists(assistantArgs.setSuggestedPrompts);
    });
  });

  describe('assistant utility functions', () => {
    it('setSuggestedPrompts should call assistant.threads.setSuggestedPrompts', async () => {
      const fakeThreadStartedArgs = createFakeThreadStartedEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs; // eslint-disable-line max-len

      const fakeClient = { assistant: { threads: { setSuggestedPrompts: sinon.spy() } } };
      fakeThreadStartedArgs.client = fakeClient as unknown as WebClient;

      const { prepareAssistantArgs } = await importAssistant();
      // casting to returned type because prepareAssistantArgs isn't built to do so
      const threadStartedArgs = prepareAssistantArgs(
        fakeThreadStartedArgs,
      ) as AllAssistantMiddlewareArgs<AssistantThreadStartedMiddlewareArgs>;

      await threadStartedArgs.setSuggestedPrompts({ prompts: [] });

      assert(fakeClient.assistant.threads.setSuggestedPrompts.called);
    });

    it('setTitle should call assistant.threads.setTitle', async () => {
      const fakeThreadStartedArgs = createFakeThreadStartedEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs; // eslint-disable-line max-len

      const fakeClient = { assistant: { threads: { setTitle: sinon.spy() } } };
      fakeThreadStartedArgs.client = fakeClient as unknown as WebClient;

      const { prepareAssistantArgs } = await importAssistant();
      // casting to returned type because prepareAssistantArgs isn't built to do so
      const threadStartedArgs = prepareAssistantArgs(
        fakeThreadStartedArgs,
      ) as AllAssistantMiddlewareArgs<AssistantThreadStartedMiddlewareArgs>;

      await threadStartedArgs.setTitle({ title: 'Title set!' });

      assert(fakeClient.assistant.threads.setTitle.called);
    });

    it('setStatus should call assistant.threads.setStatus', async () => {
      const fakeThreadStartedArgs = createFakeThreadStartedEvent() as unknown as AssistantMiddlewareArgs & AllMiddlewareArgs; // eslint-disable-line max-len

      const fakeClient = { assistant: { threads: { setStatus: sinon.spy() } } };
      fakeThreadStartedArgs.client = fakeClient as unknown as WebClient;

      const { prepareAssistantArgs } = await importAssistant();
      // casting to returned type because prepareAssistantArgs isn't built to do so
      const threadStartedArgs = prepareAssistantArgs(
        fakeThreadStartedArgs,
      ) as AllAssistantMiddlewareArgs<AssistantThreadStartedMiddlewareArgs>;

      await threadStartedArgs.setStatus({ status: 'Status set!' });

      assert(fakeClient.assistant.threads.setStatus.called);
    });
  });

  describe('processStepMiddleware', () => {
    it('should call each callback in user-provided middleware', async () => {
      const { ...fakeArgs } = createFakeThreadContextChangedEvent() as unknown as AllAssistantMiddlewareArgs;
      const { processAssistantMiddleware } = await importAssistant();

      const fn1 = sinon.spy((async ({ next: continuation }) => {
        await continuation();
      }) as Middleware<AssistantThreadStartedEvent>);
      const fn2 = sinon.spy(async () => {});
      const fakeMiddleware = [fn1, fn2] as AssistantMiddleware;

      await processAssistantMiddleware(fakeArgs, fakeMiddleware);

      assert(fn1.called);
      assert(fn2.called);
    });
  });
});

function createFakeThreadStartedEvent() {
  return {
    // body: {
    //   callback_id: 'test_edit_callback_id',
    //   trigger_id: 'test_edit_trigger_id',
    // },
    payload: {
      type: 'assistant_thread_started',
      assistant_thread: {
        user_id: '',
        context: {
          channel_id: '',
          team_id: '',
          enterprise_id: '',
        },
        channel_id: '',
        thread_ts: '',
      },
      event_ts: '',
    },
    // action: {
    //   workflow_step: {},
    // },
    // context: {},
  };
}

function createFakeThreadContextChangedEvent() {
  return {
    // body: {
    //   callback_id: 'test_edit_callback_id',
    //   trigger_id: 'test_edit_trigger_id',
    // },
    payload: {
      type: 'assistant_thread_context_changed',
      assistant_thread: {
        user_id: '',
        context: {
          channel_id: '',
          team_id: '',
          enterprise_id: '',
        },
        channel_id: '',
        thread_ts: '',
      },
      event_ts: '',
    },
    // action: {
    //   workflow_step: {},
    // },
    // context: {},
  };
}

function createFakeUserMessageEvent() {
  return {
    // body: {
    //   callback_id: 'test_execute_callback_id',
    //   trigger_id: 'test_execute_trigger_id',
    // },
    // event: {
    //   workflow_step: {},
    // },
    payload: {
      user: 'W013QGS7BPF',
      type: 'message',
      ts: '1725906578.238409',
      text: 'test',
      team: 'T014GJXU940',
      user_team: 'T014GJXU940',
      source_team: 'T014GJXU940',
      user_profile: {},
      thread_ts: '1725906530.124889',
      parent_user_id: 'U07KHARPYCQ',
      blocks: [],
      channel: 'D07JUHHV4FL',
      event_ts: '1725906578.238409',
      channel_type: 'im',
    },
    context: {},
  };
}

function createFakeMessageEvent() {
  return {
    // body: {
    //   callback_id: 'test_view_callback_id',
    //   trigger_id: 'test_view_trigger_id',
    //   workflow_step: {
    //     workflow_step_edit_id: '',
    //   },
    // },
    payload: {
      user: 'W013QGS7BPF',
      type: 'message',
      subtype: 'bot',
      ts: '1725906578.238409',
      text: 'test',
      team: 'T014GJXU940',
      user_team: 'T014GJXU940',
      source_team: 'T014GJXU940',
      user_profile: {},
      thread_ts: '1725906530.124889',
      parent_user_id: 'U07KHARPYCQ',
      blocks: [],
      channel: 'D07JUHHV4FL',
      event_ts: '1725906578.238409',
      channel_type: 'im',
    },
    context: {},
  };
}
