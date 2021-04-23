import { expectError, expectType } from 'tsd';
import { App, MessageShortcut } from '../';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling shortcut method with incorrect an type constraint value should not work
expectError(app.shortcut({ type: 'Something wrong' }, async ({ shortcut }) => {
  await Promise.resolve(shortcut);
}));

// Shortcut in listener should be - MessageShortcut
expectType<void>(app.shortcut({ type: 'message_action' }, async ({ shortcut }) => {
  expectType<MessageShortcut>(shortcut);
  await Promise.resolve(shortcut);
}));

// If shortcut is parameterized with MessageShortcut, shortcut argument in callback should be type MessageShortcut
expectType<void>(app.shortcut<MessageShortcut>({}, async ({ shortcut }) => {
  expectType<MessageShortcut>(shortcut);
  await Promise.resolve(shortcut);
}));
