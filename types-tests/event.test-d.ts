import { expectNotType, expectType } from 'tsd';
import { App, SlackEvent, AppMentionEvent, ReactionAddedEvent, ReactionRemovedEvent } from '..';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

expectType<void>(
  app.event('app_mention', async ({ event }) => {
    expectType<AppMentionEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  })
);

expectType<void>(
  app.event('reaction_added', async ({ event }) => {
    expectType<ReactionAddedEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  })
);

expectType<void>(
  app.event('reaction_removed', async ({ event }) => {
    expectType<ReactionRemovedEvent>(event);
    expectNotType<SlackEvent>(event);
    await Promise.resolve(event);
  })
);
