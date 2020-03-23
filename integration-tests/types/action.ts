// import App, { ActionConstraints } from '../../src/App';
import { App } from '@slack/bolt';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling action method with incorrect an type constraint value should not work
// $ExpectError
app.action({ type: 'Something wrong' }, ({ action }) => {
  return action;
});

/* Not working
// Should error because message_action doesn't have type action_id
// $ Expect Error
app.action({ type: 'message_action', action_id: 'dafasf' }, ({ action }) => {
    return action;
});
*/

// $ExpectType void
app.action({ type: 'block_actions' }, async ({
  action, // $ExpectType BlockElementAction
 }) => {
  return action;
});

// $ExpectType void
app.action({ type: 'interactive_message' }, async ({
  action, // $ExpectType InteractiveAction
 }) => {
  return action;
});

// $ExpectType void
app.action({ type: 'dialog_submission' }, async ({
  action, // $ExpectType DialogSubmitAction
 }) => {
  return action;
});

/* Not working
// Should error because MessageAction doesn't have an action_id
// $ Expect Error
app.actiong<MessageAction>({ action_id: 'dafasf' }, ({ action }) => {
    // NOT WORKING
    return action;
});
*/
