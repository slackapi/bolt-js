import { expectType, expectNotType } from 'tsd';
import { App, OptionsRequest, OptionsSource } from '../dist';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectType<void>(app.options('action-id-or-callback-id', async ({ options }) => {
  expectType<OptionsRequest<OptionsSource>>(options);
  await Promise.resolve(options);
}));

// block_suggestion
expectType<void>(app.options<'block_suggestion'>({ action_id: 'a' }, async ({ options }) => {
  expectNotType<OptionsRequest<OptionsSource>>(options);
  expectType<OptionsRequest<'block_suggestion'>>(options);
  await Promise.resolve(options);
}));
// FIXME: app.options({ type: 'block_suggestion', action_id: 'a' } does not work

// interactive_message (attachments)
expectType<void>(app.options<'interactive_message'>({ callback_id: 'a' }, async ({ options }) => {
  expectNotType<OptionsRequest<OptionsSource>>(options);
  expectType<OptionsRequest<'interactive_message'>>(options);
  await Promise.resolve(options);
}));

expectType<void>(app.options({ type: 'interactive_message', callback_id: 'a' }, async ({ options }) => {
  // FIXME: the type should be OptionsRequest<'interactive_message'>
  expectType<OptionsRequest<OptionsSource>>(options);
  await Promise.resolve(options);
}));

// dialog_suggestion (dialog)
expectType<void>(app.options<'dialog_suggestion'>({ callback_id: 'a' }, async ({ options }) => {
  expectNotType<OptionsRequest<OptionsSource>>(options);
  expectType<OptionsRequest<'dialog_suggestion'>>(options);
  await Promise.resolve(options);
}));
// FIXME: app.options({ type: 'dialog_suggestion', callback_id: 'a' } does not work
