import { expectNotType, expectType } from 'tsd';
import type {
  AppMentionEvent,
  PinAddedEvent,
  PinRemovedEvent,
  ReactionAddedEvent,
  ReactionRemovedEvent,
  SlackEvent,
  UserHuddleChangedEvent,
  UserProfileChangedEvent,
  UserStatusChangedEvent,
} from '@slack/types';
import type { SayFn } from '../../';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectType<void>(
  app.event('app_mention', async ({ event }) => {
    expectType<AppMentionEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('reaction_added', async ({ event }) => {
    expectType<ReactionAddedEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('reaction_removed', async ({ event }) => {
    expectType<ReactionRemovedEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('user_huddle_changed', async ({ event }) => {
    expectType<UserHuddleChangedEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('user_profile_changed', async ({ event }) => {
    expectType<UserProfileChangedEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('user_status_changed', async ({ event }) => {
    expectType<UserStatusChangedEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('pin_added', async ({ say, event }) => {
    expectType<SayFn>(say);
    expectType<PinAddedEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('pin_removed', async ({ say, event }) => {
    expectType<SayFn>(say);
    expectType<PinRemovedEvent>(event);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('reaction_added', async ({ say, event }) => {
    expectType<SayFn>(say);
    await Promise.resolve(event);
  }),
);

expectType<void>(
  app.event('reaction_removed', async ({ say, event }) => {
    expectType<SayFn>(say);
    await Promise.resolve(event);
  }),
);
