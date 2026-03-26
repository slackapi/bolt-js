import { expectType } from 'tsd';
import type { SayStreamFn } from '../../';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// sayStream is available on message events (channel + ts)
app.event('message', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// sayStream is available on app_mention events (channel + ts)
app.event('app_mention', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// sayStream is available on assistant_thread_started events (assistant_thread.channel_id + assistant_thread.thread_ts)
app.event('assistant_thread_started', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

// sayStream is NOT available on reaction_added (item.channel but no ts/thread_ts at top level)
app.event('reaction_added', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

// sayStream is NOT available on app_home_opened (channel but no ts)
app.event('app_home_opened', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

// sayStream is NOT available on message_metadata_posted (channel_id but no ts)
app.event('message_metadata_posted', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

// sayStream is NOT available on channel_created (channel.id but no ts)
app.event('channel_created', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

// sayStream is NOT available on events without channel context at all
app.event('user_huddle_changed', async (args) => {
  // @ts-expect-error - sayStream should not exist on events without channel context
  const _stream: SayStreamFn = args.sayStream;
});
