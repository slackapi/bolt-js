import type { AssistantThreadsSetSuggestedPromptsResponse } from '@slack/web-api';
import { expectError, expectType } from 'tsd';
import { type AllAssistantMiddlewareArgs, Assistant } from '../../src/Assistant';
import type { AssistantThreadContext } from '../../src/AssistantThreadContextStore';

// Constructor tests
const asyncNoop = () => Promise.resolve();

// missing required properties `threadStarted` and `userMessage`
expectError(new Assistant({}));

// missing required property `threadStarted`
expectError(
  new Assistant({
    userMessage: asyncNoop,
  }),
);

// missing required property `userMessage`
expectError(
  new Assistant({
    threadStarted: asyncNoop,
  }),
);

// happy construction
expectType<Assistant>(
  new Assistant({
    threadStarted: asyncNoop,
    userMessage: asyncNoop,
  }),
);

// threadStarted tests
new Assistant({
  userMessage: asyncNoop,
  threadStarted: async ({ saveThreadContext, setSuggestedPrompts }) => {
    expectType<void>(await saveThreadContext());
    expectType<AssistantThreadsSetSuggestedPromptsResponse>(
      await setSuggestedPrompts({
        prompts: [],
      }),
    );
    return Promise.resolve();
  },
});

// userMessage tests
new Assistant({
  userMessage: async ({ getThreadContext }) => {
    expectType<AssistantThreadContext>(await getThreadContext());
    return Promise.resolve();
  },
  threadStarted: asyncNoop,
});

// threadContextChanged tests
new Assistant({
  userMessage: asyncNoop,
  threadStarted: asyncNoop,
  threadContextChanged: async ({ event }) => {
    expectType<AssistantThreadContext>(event.assistant_thread.context);
    return Promise.resolve();
  },
});

// threadContextStore tests
new Assistant({
  threadContextStore: {
    get: async (args) => {
      expectType<AllAssistantMiddlewareArgs>(args);
      return Promise.resolve({});
    },
    save: async (args) => {
      expectType<AllAssistantMiddlewareArgs>(args);
      return Promise.resolve();
    },
  },
  userMessage: asyncNoop,
  threadStarted: asyncNoop,
});
