import { expectType } from 'tsd';
import { App, SlashCommand } from '../dist';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectType<void>(app.command('/hello', async ({ command }) => {
  expectType<SlashCommand>(command);
  await Promise.resolve(command);
}));
