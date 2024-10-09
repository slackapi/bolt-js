import { expectAssignable, expectType } from 'tsd';
import type { SlashCommand } from '../..';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.command('/hello', async ({ command }) => {
  expectType<SlashCommand>(command);
});

interface MyContext {
  doesnt: 'matter';
}
// Ensure custom context assigned to individual middleware is honoured
app.command<MyContext>('/action', async ({ context }) => {
  expectAssignable<MyContext>(context);
});

// Ensure custom context assigned to the entire app is honoured
const typedContextApp = new App<MyContext>();
typedContextApp.command('/action', async ({ context }) => {
  expectAssignable<MyContext>(context);
});
