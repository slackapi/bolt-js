import { expectAssignable, expectType } from 'tsd';
import type { SlackViewAction, ViewOutput } from '../..';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// view_submission
app.view('modal-id', async ({ body, view }) => {
  // TODO: the body can be more specific (ViewSubmitAction) here
  expectType<SlackViewAction>(body);
  expectType<ViewOutput>(view);
});

app.view({ type: 'view_submission', callback_id: 'modal-id' }, async ({ body, view }) => {
  // TODO: the body can be more specific (ViewSubmitAction) here. need to add a type parameter (generic) to view() and 'link' constraint w/ view types.
  expectType<SlackViewAction>(body);
  expectType<ViewOutput>(view);
});

// view_closed
app.view({ type: 'view_closed', callback_id: 'modal-id' }, async ({ body, view }) => {
  // TODO: the body can be more specific (ViewClosedAction) here. need to add a type parameter (generic) to view() and 'link' constraint w/ view types.
  expectType<SlackViewAction>(body);
  expectType<ViewOutput>(view);
});

interface MyContext {
  doesnt: 'matter';
}
// Ensure custom context assigned to individual middleware is honoured
app.view<SlackViewAction, MyContext>('view-id', async ({ context }) => {
  expectAssignable<MyContext>(context);
});

// Ensure custom context assigned to the entire app is honoured
const typedContextApp = new App<MyContext>();
typedContextApp.view('view-id', async ({ context }) => {
  expectAssignable<MyContext>(context);
});
