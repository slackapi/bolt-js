import { expectError, expectType } from 'tsd';
import { App, GlobalShortcut, MessageShortcut, SayFn } from '../';

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

expectType<void>(app.shortcut({}, async ({ shortcut, say }) => {
  expectType<SayFn | undefined>(say);
  await Promise.resolve(shortcut);
}));

// If shortcut is parameterized with MessageShortcut, say argument in callback should be type SayFn
expectType<void>(app.shortcut<MessageShortcut>({}, async ({ shortcut, say }) => {
  expectType<SayFn>(say);
  await Promise.resolve(shortcut);
}));

// If shortcut is parameterized with GlobalShortcut, say argument in callback should be type undefined
expectType<void>(app.shortcut<GlobalShortcut>({}, async ({ shortcut, say }) => {
  expectType<undefined>(say);
  await Promise.resolve(shortcut);
}));
