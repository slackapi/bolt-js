import { expectError, expectType } from 'tsd';
import type { GlobalShortcut, MessageShortcut, SayFn, SlackShortcut } from '../..';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling shortcut method with incorrect type constraint value should not work
expectError(
  app.shortcut({ type: 'Something wrong' }, async ({ shortcut }) => {
    await Promise.resolve(shortcut);
  }),
);

app.shortcut({ type: 'message_action' }, async ({ shortcut, say }) => {
  // Shortcut in listener should be MessageShortcut if type:message_action
  expectType<MessageShortcut>(shortcut);
  expectType<SayFn>(say);
});

// If shortcut is parameterized with MessageShortcut, shortcut argument in callback should be type MessageShortcut
app.shortcut<MessageShortcut>({}, async ({ shortcut, say }) => {
  expectType<MessageShortcut>(shortcut);
  expectType<SayFn>(say);
});

// If the constraint is unspecific, say may be undefined and the shortcut is the more general SlackShortcut type
app.shortcut({}, async ({ shortcut, say }) => {
  expectType<SlackShortcut>(shortcut);
  expectType<SayFn | undefined>(say);
});

// If shortcut is parameterized with GlobalShortcut, say argument in callback should be type undefined
app.shortcut<GlobalShortcut>({}, async ({ shortcut, say }) => {
  expectType<undefined>(say);
  expectType<GlobalShortcut>(shortcut);
});

// TODO: test the Shortcut and Constraints type parameters and how they can rely on each other.
// relates to https://github.com/slackapi/bolt-js/issues/796; proof out how the Shortcut type parameter can provide nice typing utilities for developers
