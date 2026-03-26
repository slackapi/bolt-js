import { expectType } from 'tsd';
import type { SayStreamFn } from '../../';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.event('message', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

app.event('app_mention', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

app.event('assistant_thread_started', async ({ sayStream }) => {
  expectType<SayStreamFn>(sayStream);
});

app.event('reaction_added', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

app.event('app_home_opened', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

app.event('message_metadata_posted', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

app.event('channel_created', async (args) => {
  // @ts-expect-error - sayStream not available without ts context
  const _stream: SayStreamFn = args.sayStream;
});

app.event('user_huddle_changed', async (args) => {
  // @ts-expect-error - sayStream should not exist on events without channel context
  const _stream: SayStreamFn = args.sayStream;
});
