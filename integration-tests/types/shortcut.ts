// import App, { ActionConstraints } from '../../src/App';
import { App, MessageShortcut } from '@slack/bolt';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling shortcut method with incorrect an type constraint value should not work
// $ExpectError
app.shortcut({ type: 'Something wrong' }, ({ shortcut }) => {
  return shortcut;
});

// Action in listener should be - MessageAction
// $ExpectType void
app.shortcut({ type: 'message_action' }, async ({
  shortcut, // $ExpectType SlackShortcut
 }) => {
  return shortcut;
});

// If action is parameterized with MessageAction, action argument in callback should be type MessageAction
// $ExpectType void
app.shortcut<MessageShortcut>({}, async ({
  shortcut, // $ExpectType MessageShortcut
 }) => {
  return shortcut;
});

/* Not Working
// Should error because MessageAction doesn't have an action_id
// $ Expect Error
app.shortcut<MessageShortcut>({ action_id: 'dafasf' }, ({ shortcut }) => {
    // NOT WORKING
  return shortcut;
});
*/
