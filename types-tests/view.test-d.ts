import { expectType } from 'tsd';
import { App, SlackViewAction, ViewOutput } from '..';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// view_submission
expectType<void>(
  app.view('modal-id', async ({ body, view }) => {
    // TODO: the body can be more specific (ViewSubmitAction) here
    expectType<SlackViewAction>(body);
    expectType<ViewOutput>(view);
    await Promise.resolve(view);
  })
);

expectType<void>(
  app.view({ type: 'view_submission', callback_id: 'modal-id' }, async ({ body, view }) => {
    // TODO: the body can be more specific (ViewSubmitAction) here
    expectType<SlackViewAction>(body);
    expectType<ViewOutput>(view);
    await Promise.resolve(view);
  })
);

// view_closed
expectType<void>(
  app.view({ type: 'view_closed', callback_id: 'modal-id' }, async ({ body, view }) => {
    // TODO: the body can be more specific (ViewClosedAction) here
    expectType<SlackViewAction>(body);
    expectType<ViewOutput>(view);
    await Promise.resolve(view);
  })
);
