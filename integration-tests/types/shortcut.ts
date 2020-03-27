// import App, { ActionConstraints } from '../../src/App';
import { App, MessageShortcut } from '@slack/bolt';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling shortcut method with incorrect an type constraint value should not work
// $ExpectError
app.shortcut({ type: 'Something wrong' }, async ({ shortcut }) => {
  await Promise.resolve(shortcut);
});

// Shortcut in listener should be - MessageShortcut
// $ExpectType void
app.shortcut({ type: 'message_action' }, async ({
  shortcut, // $ExpectType MessageShortcut
 }) => {
  await Promise.resolve(shortcut);
});

// If shortcut is parameterized with MessageShortcut, shortcut argument in callback should be type MessageShortcut
// $ExpectType void
app.shortcut<MessageShortcut>({}, async ({
  shortcut, // $ExpectType MessageShortcut
 }) => {
  await Promise.resolve(shortcut);
});
