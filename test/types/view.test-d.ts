import { expectAssignable, expectError, expectType } from 'tsd';
import type { AckFn, SlackViewAction, ViewOutput, ViewResponseAction } from '../..';
import App from '../../src/App';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// invalid view constraints
expectError(
  app.view(
    {
      callback_id: 'foo',
      type: 'view_submission',
      unknown_key: 'should be detected',
    },
    async () => { },
  ),
);
expectError(
  app.view(
    {
      callback_id: 'foo',
      type: undefined,
      unknown_key: 'should be detected',
    },
    async () => { },
  ),
);
// view_submission
app.view('modal-id', async ({ body, view, ack }) => {
  // TODO: the body can be more specific (ViewSubmitAction) here
  expectType<SlackViewAction>(body);
  expectType<ViewOutput>(view);
  // TODO: assert on type assignability for `ack`
});

app.view({ type: 'view_submission', callback_id: 'modal-id' }, async ({ body, view }) => {
  // TODO: the body can be more specific (ViewSubmitAction) here. need to add a type parameter (generic) to view() and 'link' constraint w/ view types.
  expectType<SlackViewAction>(body);
  expectType<ViewOutput>(view);
  // TODO: assert on type assignability for `ack`
});

// view_closed
app.view({ type: 'view_closed', callback_id: 'modal-id' }, async ({ body, view }) => {
  // TODO: the body can be more specific (ViewClosedAction) here. need to add a type parameter (generic) to view() and 'link' constraint w/ view types.
  expectType<SlackViewAction>(body);
  expectType<ViewOutput>(view);
  // TODO: assert on type assignability for `ack`
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
