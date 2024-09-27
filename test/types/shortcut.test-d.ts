import { expectAssignable, expectError, expectType } from 'tsd';
import type { GlobalShortcut, MessageShortcut, SayFn, SlackShortcut } from '../..';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// calling shortcut method with incorrect type constraint value should not work
expectError(
  app.shortcut({ type: 'Something wrong' }, async ({ shortcut }) => {
    await Promise.resolve(shortcut);
  }),
);

// Shortcut in listener should be MessageShortcut if constraint is type:message_action
app.shortcut({ type: 'message_action' }, async ({ shortcut, say }) => {
  expectType<MessageShortcut>(shortcut);
  expectType<SayFn>(say);
});

// If shortcut is parameterized with MessageShortcut, shortcut argument in callback should be type MessageShortcut
app.shortcut<MessageShortcut>({}, async ({ shortcut, say }) => {
  expectType<MessageShortcut>(shortcut);
  expectType<SayFn>(say);
});

// If the constraint is unspecific, say will be unavailable
expectError(app.shortcut({}, async ({ say }) => say()));

// If the constraint is unspecific, the shortcut is the more general SlackShortcut type
app.shortcut({}, async ({ shortcut }) => {
  expectType<SlackShortcut>(shortcut);
});

// `say` in listener should be unavailable if constraint is type:shortcut
expectError(app.shortcut({ type: 'shortcut' }, async ({ say }) => say()));

// Shortcut in listener should be GlobalShortcut if constraint is type:shortcut
app.shortcut({ type: 'shortcut' }, async ({ shortcut }) => {
  expectType<GlobalShortcut>(shortcut);
});

// If shortcut is parameterized with GlobalShortcut, say argument in callback should not be available
expectError(app.shortcut<GlobalShortcut>({}, async ({ say }) => say()));

// If shortcut is parameterized with GlobalShortcut, shortcut parameter should be of type GlobalShortcut
app.shortcut<GlobalShortcut>({}, async ({ shortcut }) => {
  expectType<GlobalShortcut>(shortcut);
});

interface MyContext {
  doesnt: 'matter';
}
// Ensure custom context assigned to individual middleware is honoured
app.shortcut<SlackShortcut, MyContext>('callback_id', async ({ context }) => {
  expectAssignable<MyContext>(context);
});

// Ensure custom context assigned to the entire app is honoured
const typedContextApp = new App<MyContext>();
typedContextApp.shortcut('callback_id', async ({ context }) => {
  expectAssignable<MyContext>(context);
});
