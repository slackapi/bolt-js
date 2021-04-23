import { expectError, expectType } from 'tsd';
import { App, BlockElementAction, InteractiveAction, DialogSubmitAction } from '../';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling action method with incorrect an type constraint value should not work
expectError(app.action({ type: 'Something wrong' }, async ({ action }) => {
  await Promise.resolve(action);
}));

expectType<void>(app.action({ type: 'block_actions' }, async ({ action }) => {
  expectType<BlockElementAction>(action);
  await Promise.resolve(action);
}));

expectType<void>(app.action({ type: 'interactive_message' }, async ({ action }) => {
  expectType<InteractiveAction>(action);
  await Promise.resolve(action);
}));

expectType<void>(app.action({ type: 'dialog_submission' }, async ({ action }) => {
  expectType<DialogSubmitAction>(action);
  await Promise.resolve(action);
}));
