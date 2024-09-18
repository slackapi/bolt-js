import type { Option } from '@slack/types';
import { expectAssignable, expectType } from 'tsd';
import App from '../../src/App';
import type {
  AckFn,
  BlockOptions,
  BlockSuggestion,
  DialogOptions,
  DialogOptionGroups,
  DialogSuggestion,
  InteractiveMessageSuggestion,
  MessageOptions,
  OptionGroups,
} from '../..';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.options('action-id-or-callback-id', async ({ options, ack }) => {
  // TODO: should BlockSuggestion belong in types package? if so, assertions on its contents should also move to types package.
  // defaults options to block_suggestion
  expectType<BlockSuggestion>(options);
  // biome-ignore lint/suspicious/noExplicitAny: TODO: should the callback ID be any? seems wrong
  expectType<any>(options.callback_id);
  options.block_id;
  options.action_id;
  // ack should allow either BlockOptions or OptionGroups
  // https://github.com/slackapi/bolt-js/issues/720
  expectAssignable<AckFn<BlockOptions>>(ack);
  expectAssignable<AckFn<OptionGroups<BlockOptions>>>(ack);
});

// FIXME: app.options({ type: 'block_suggestion', action_id: 'a' } does not constrain the arguments of the handler down to `block_suggestion`

// interactive_message (attachments)
app.options<'interactive_message'>({ callback_id: 'a' }, async ({ options, ack }) => {
  expectType<InteractiveMessageSuggestion>(options);
  // ack should allow either MessageOptions or OptionGroups
  // https://github.com/slackapi/bolt-js/issues/720
  expectAssignable<AckFn<MessageOptions>>(ack);
  expectAssignable<AckFn<OptionGroups<MessageOptions>>>(ack);
});

// FIXME: app.options({ type: 'interactive_message', callback_id: 'a' } does not constrain the arguments of the handler down to `interactive_message`

// dialog_suggestion (dialog)
app.options<'dialog_suggestion'>({ callback_id: 'a' }, async ({ options, ack }) => {
  expectType<DialogSuggestion>(options);
  // ack should allow either MessageOptions or OptionGroups
  // https://github.com/slackapi/bolt-js/issues/720
  expectAssignable<AckFn<DialogOptions>>(ack);
  expectAssignable<AckFn<DialogOptionGroups<DialogOptions>>>(ack);
});
// FIXME: app.options({ type: 'dialog_suggestion', callback_id: 'a' } does not constrain the arguments of the handler down to `dialog_sggestion`

const db = {
  get: (_teamId: string) => {
    return [{ label: 'l', value: 'v' }];
  },
};

// Taken from https://slack.dev/bolt-js/concepts#options
// Example of responding to an external_select options request
app.options('external_action', async ({ options, ack }) => {
  // Get information specific to a team or channel
  // TODO: modified to satisfy TS compiler; should team be optional?
  const results = options.team != null ? db.get(options.team.id) : [];

  if (results) {
    // (modified to satisfy TS compiler)
    const options: Option[] = [];
    // Collect information in options array to send in Slack ack response
    for (const result of results) {
      options.push({
        text: {
          type: 'plain_text',
          text: result.label,
        },
        value: result.value,
      });
    }

    await ack({
      options: options,
    });
  } else {
    await ack();
  }
});

interface MyContext {
  doesnt: 'matter';
}
// Ensure custom context assigned to individual middleware is honoured
app.options<'block_suggestion', MyContext>('suggest', async ({ context }) => {
  expectAssignable<MyContext>(context);
});

// Ensure custom context assigned to the entire app is honoured
const typedContextApp = new App<MyContext>();
typedContextApp.options('suggest', async ({ context }) => {
  expectAssignable<MyContext>(context);
});
