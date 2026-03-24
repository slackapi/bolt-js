import { expectType } from 'tsd';
import type { SayStreamFn } from '../../';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// sayStream is available on message events (which have channel context)
app.event('message', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// sayStream is available on app_mention events (which have channel context)
app.event('app_mention', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// sayStream is available on reaction_added events (which have channel via item)
app.event('reaction_added', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// sayStream is available on assistant_thread_started events (which have channel via assistant_thread)
app.event('assistant_thread_started', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// sayStream is available on app_home_opened events (which have channel context)
app.event('app_home_opened', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// Verify sayStream is NOT available on events without channel context
// The type for user_huddle_changed should not include sayStream since the event has no channel
app.event('user_huddle_changed', async (args) => {
  // @ts-expect-error - sayStream should not exist on events without channel context
  const _stream: SayStreamFn = args.sayStream;
});
