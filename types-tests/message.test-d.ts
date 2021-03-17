import { expectNotType, expectType } from 'tsd';
import { App, MessageEvent, BotMessageEvent, MessageRepliedEvent, MeMessageEvent, MessageDeletedEvent, ThreadBroadcastMessageEvent, MessageChangedEvent, EKMAccessDeniedMessageEvent } from '..';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectType<void>(
  // TODO: Resolve the event type when having subtype in a listener constraint
  // app.message({pattern: 'foo', subtype: 'message_replied'}, async ({ message }) => {});
  app.message(async ({ message }) => {
    expectType<MessageEvent>(message);

    if (message.subtype === 'bot_message') {
      expectType<BotMessageEvent>(message);
      expectNotType<MessageEvent>(message);
    }
    if (message.subtype === 'ekm_access_denied') {
      expectType<EKMAccessDeniedMessageEvent>(message);
      expectNotType<MessageEvent>(message);
    }
    if (message.subtype === 'me_message') {
      expectType<MeMessageEvent>(message);
      expectNotType<MessageEvent>(message);
    }
    if (message.subtype === 'message_replied') {
      expectType<MessageRepliedEvent>(message);
      expectNotType<MessageEvent>(message);
    }
    if (message.subtype === 'message_changed') {
      expectType<MessageChangedEvent>(message);
      expectNotType<MessageEvent>(message);
    }
    if (message.subtype === 'message_deleted') {
      expectType<MessageDeletedEvent>(message);
      expectNotType<MessageEvent>(message);
    }
    if (message.subtype === 'thread_broadcast') {
      expectType<ThreadBroadcastMessageEvent>(message);
      expectNotType<MessageEvent>(message);
    }

    await Promise.resolve(message);
  }),
);
