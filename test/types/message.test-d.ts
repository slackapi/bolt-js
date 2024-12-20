import type {
  AllMessageEvents,
  BotMessageEvent,
  EKMAccessDeniedMessageEvent,
  GenericMessageEvent,
  MeMessageEvent,
  MessageChangedEvent,
  MessageDeletedEvent,
  MessageEvent,
  MessageRepliedEvent,
  ThreadBroadcastMessageEvent,
} from '@slack/types';
import { expectAssignable, expectError, expectNotType, expectType } from 'tsd';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// TODO: asserting on the types of event sub-properties is a responsibility of the `@slack/types` package, not bolt.
// e.g. message.user, message.team, etc.
//
// Types for generic message listeners, i.e. MessageEvent
app.message(async ({ message }) => {
  expectType<MessageEvent>(message);

  expectType<string>(message.channel);
  // The type here is still a union type of all the possible subtyped events.
  // Thus, only the fields available for all the types can be resolved outside if/else statements.
  expectError(message.user);

  // TODO: what if subtype is not on the message at all? e.g. !('subtype' in message)
  if (message.subtype === undefined) {
    expectType<GenericMessageEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    expectType<string>(message.user);
    expectType<string>(message.channel);
    // TODO: should this be potentially undefined? Not all of the various Message event subtype interfaces
    // (in @slack/types) have a `team` property - is that correct? Also the GenericMessageEvent has team as optional.
    expectType<string | undefined>(message.team);
  }
  if (message.subtype === 'bot_message') {
    expectType<BotMessageEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    // TODO: should this be potentially undefined?
    expectType<string | undefined>(message.user);
    expectType<string>(message.channel);
  }
  if (message.subtype === 'ekm_access_denied') {
    expectType<EKMAccessDeniedMessageEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    expectType<string>(message.channel);
  }
  if (message.subtype === 'me_message') {
    expectType<MeMessageEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    expectType<string>(message.user);
    expectType<string>(message.channel);
  }
  if (message.subtype === 'message_replied') {
    expectType<MessageRepliedEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    expectType<string>(message.channel);
    expectType<string>(message.message.thread_ts);
    // expectType<string>(message.message.text); // TODO: womp womp https://github.com/slackapi/bolt-js/issues/1572
  }
  if (message.subtype === 'message_changed') {
    expectType<MessageChangedEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    expectType<string>(message.channel);
    expectType<AllMessageEvents>(message.message);
  }
  if (message.subtype === 'message_deleted') {
    expectType<MessageDeletedEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    expectType<string>(message.channel);
    expectType<string>(message.ts);
  }
  if (message.subtype === 'thread_broadcast') {
    expectType<ThreadBroadcastMessageEvent>(message);
    expectNotType<MessageEvent>(message);
    // TODO: move these assertions to `@slack/types`
    expectType<string>(message.channel);
    // TODO: this being potentially undefined seems wrong!
    expectType<string | undefined>(message.thread_ts);
    expectType<string>(message.ts);
    // TODO: the actual type here seems wrong...
    expectNotType<undefined | null>(message.root);
  }

  await Promise.resolve(message);
});

interface MyContext {
  doesnt: 'matter';
}
// Ensure custom context assigned to individual middleware is honoured
app.message<MyContext>(async ({ context }) => {
  expectAssignable<MyContext>(context);
});

// Ensure custom context assigned to the entire app is honoured
const typedContextApp = new App<MyContext>();
typedContextApp.message(async ({ context }) => {
  expectAssignable<MyContext>(context);
});
