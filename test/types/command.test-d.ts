import { expectType } from 'tsd';
import type { SlashCommand } from '../..';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectType<void>(
  app.command('/hello', async ({ command }) => {
    expectType<SlashCommand>(command);
    await Promise.resolve(command);
  }),
);
