import { expectType } from 'tsd';
import { App, MessageEvent, BotMessageEvent } from '../';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectType<void>(
  app.message(async ({ message }) => {
    expectType<MessageEvent>(message);

    if (message.subtype === 'bot_message') {
      expectType<BotMessageEvent>(message);
    }

    await Promise.resolve(message);
  }),
);
