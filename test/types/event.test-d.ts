import { expectType } from 'tsd';
import type {
  AppMentionEvent,
  PinAddedEvent,
  PinRemovedEvent,
  ReactionAddedEvent,
  ReactionRemovedEvent,
  UserHuddleChangedEvent,
  UserProfileChangedEvent,
  UserStatusChangedEvent,
} from '@slack/types';
import type { SayFn } from '../../';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

app.event('app_mention', async ({ event }) => {
  expectType<AppMentionEvent>(event);
});

app.event('reaction_added', async ({ event }) => {
  expectType<ReactionAddedEvent>(event);
});

app.event('reaction_removed', async ({ event }) => {
  expectType<ReactionRemovedEvent>(event);
});

app.event('user_huddle_changed', async ({ event }) => {
  expectType<UserHuddleChangedEvent>(event);
});

app.event('user_profile_changed', async ({ event }) => {
  expectType<UserProfileChangedEvent>(event);
});

app.event('user_status_changed', async ({ event }) => {
  expectType<UserStatusChangedEvent>(event);
});

app.event('pin_added', async ({ say, event }) => {
  expectType<SayFn>(say);
  expectType<PinAddedEvent>(event);
});

app.event('pin_removed', async ({ say, event }) => {
  expectType<SayFn>(say);
  expectType<PinRemovedEvent>(event);
});

app.event('reaction_added', async ({ say, event }) => {
  expectType<SayFn>(say);
  expectType<ReactionAddedEvent>(event);
});

app.event('reaction_removed', async ({ say, event }) => {
  expectType<SayFn>(say);
  expectType<ReactionRemovedEvent>(event);
});
