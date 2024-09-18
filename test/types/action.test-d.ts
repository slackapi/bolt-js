import { expectAssignable, expectError, expectType } from 'tsd';
import type { SlackAction, BlockElementAction, DialogSubmitAction, InteractiveAction } from '../../';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling action method with incorrect an type constraint value should not work
expectError(
  app.action({ type: 'Something wrong' }, async ({ action }) => {
    await Promise.resolve(action);
  }),
);

app.action({ type: 'block_actions' }, async ({ action }) => {
  expectType<BlockElementAction>(action);
});

app.action({ type: 'interactive_message' }, async ({ action }) => {
  expectType<InteractiveAction>(action);
});

app.action({ type: 'dialog_submission' }, async ({ action }) => {
  expectType<DialogSubmitAction>(action);
});

interface MyContext {
  doesnt: 'matter';
}
// Ensure custom context assigned to individual middleware is honoured
app.action<SlackAction, MyContext>('action_id', async ({ context }) => {
  expectAssignable<MyContext>(context);
});

// Ensure custom context assigned to the entire app is honoured
const typedContextApp = new App<MyContext>();
typedContextApp.action('action_id', async ({ context }) => {
  expectAssignable<MyContext>(context);
});
