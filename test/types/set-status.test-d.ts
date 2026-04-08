import { expectType } from 'tsd';
import type { SetStatusFn } from '../../';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.event('message', async ({ setStatus }) => {
  expectType<SetStatusFn>(setStatus);
});

app.event('app_mention', async ({ setStatus }) => {
  expectType<SetStatusFn>(setStatus);
});

app.event('assistant_thread_started', async ({ setStatus }) => {
  expectType<SetStatusFn>(setStatus);
});

app.message('*', async ({ setStatus }) => {
  expectType<SetStatusFn>(setStatus);
});

app.event('reaction_added', async (args) => {
  // @ts-expect-error - setStatus not available without ts context
  const _status: SetStatusFn = args.setStatus;
});

app.event('app_home_opened', async (args) => {
  // @ts-expect-error - setStatus not available without ts context
  const _status: SetStatusFn = args.setStatus;
});

app.event('message_metadata_posted', async (args) => {
  // @ts-expect-error - setStatus not available without ts context
  const _status: SetStatusFn = args.setStatus;
});

app.event('channel_created', async (args) => {
  // @ts-expect-error - setStatus not available without ts context
  const _status: SetStatusFn = args.setStatus;
});

app.event('user_huddle_changed', async (args) => {
  // @ts-expect-error - setStatus should not exist on events without channel context
  const _status: SetStatusFn = args.setStatus;
});

app.action('button_click', async (args) => {
  // @ts-expect-error - setStatus should not exist on action listeners
  const _status: SetStatusFn = args.setStatus;
});

app.command('/slash-command', async (args) => {
  // @ts-expect-error - setStatus should not exist on command listeners
  const _status: SetStatusFn = args.setStatus;
});

app.function('sample-func', async (args) => {
  // @ts-expect-error - setStatus should not exist on function listeners
  const _status: SetStatusFn = args.setStatus;
});

app.view('my-view', async (args) => {
  // @ts-expect-error - setStatus should not exist on view listeners
  const _status: SetStatusFn = args.setStatus;
});

app.options('my-options', async (args) => {
  // @ts-expect-error - setStatus should not exist on option listeners
  const _status: SetStatusFn = args.setStatus;
});
