import { expectType, expectError } from 'tsd';
import {
  App,
  SlackOptions,
  BlockSuggestion,
  InteractiveMessageSuggestion,
  DialogSuggestion,
} from '../dist';
import { Option } from '@slack/types';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

const blockSuggestionOptions: Option[] = [
  {
    text: {
      type: 'plain_text',
      text: 'foo',
    },
    value: 'bar',
  },
];

// set the default to block_suggestion
expectType<void>(
  app.options('action-id-or-callback-id', async ({ options, ack }) => {
    expectType<BlockSuggestion>(options);
    // resolved by StringIndexed
    expectType<any>(options.callback_id);
    options.block_id;
    options.action_id;
    // https://github.com/slackapi/bolt-js/issues/720
    await ack({ options: blockSuggestionOptions });
    await Promise.resolve(options);
  }),
);

// block_suggestion
expectType<void>(
  app.options<'block_suggestion'>({ action_id: 'a' }, async ({ options, ack }) => {
    expectType<BlockSuggestion>(options);
    // https://github.com/slackapi/bolt-js/issues/720
    await ack({ options: blockSuggestionOptions });
    await Promise.resolve(options);
  }),
);
// FIXME: app.options({ type: 'block_suggestion', action_id: 'a' } does not work

// interactive_message (attachments)
expectType<void>(
  app.options<'interactive_message'>({ callback_id: 'a' }, async ({ options, ack }) => {
    expectType<InteractiveMessageSuggestion>(options);
    // https://github.com/slackapi/bolt-js/issues/720
    expectError(ack({ options: blockSuggestionOptions }));
    await Promise.resolve(options);
  }),
);

expectType<void>(
  app.options({ type: 'interactive_message', callback_id: 'a' }, async ({ options, ack }) => {
    // FIXME: the type should be OptionsRequest<'interactive_message'>
    expectType<SlackOptions>(options);
    // https://github.com/slackapi/bolt-js/issues/720
    expectError(ack({ options: blockSuggestionOptions }));
    await Promise.resolve(options);
  }),
);

// dialog_suggestion (dialog)
expectType<void>(
  app.options<'dialog_suggestion'>({ callback_id: 'a' }, async ({ options, ack }) => {
    expectType<DialogSuggestion>(options);
    // https://github.com/slackapi/bolt-js/issues/720
    expectError(ack({ options: blockSuggestionOptions }));
    await Promise.resolve(options);
  }),
);
// FIXME: app.options({ type: 'dialog_suggestion', callback_id: 'a' } does not work

const db = {
  get: (_teamId: String) => { return [{ label: 'l', value: 'v' }]; },
};

expectType<void>(
  // Taken from https://slack.dev/bolt-js/concepts#options
  // Example of responding to an external_select options request
  app.options('external_action', async ({ options, ack }) => {
    // Get information specific to a team or channel
    // (modified to satisfy TS compiler)
    const results = options.team != null ? await db.get(options.team.id) : [];

    if (results) {
      // (modified to satisfy TS compiler)
      let options: Option[] = [];
      // Collect information in options array to send in Slack ack response
      for (const result of results) {
        options.push({
          "text": {
            "type": "plain_text",
            "text": result.label
          },
          "value": result.value
        });
      }

      await ack({
        "options": options
      });
    } else {
      await ack();
    }
  })
);
