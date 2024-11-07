import { expectError, expectType } from 'tsd';
import { Assistant } from '../../src/Assistant';

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
  threadStarted: async ({ saveThreadContext }) => {
    expectType<void>(await saveThreadContext());
    return Promise.resolve();
  },
});
