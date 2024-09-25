import { expectAssignable } from 'tsd';
import App from '../../src/App';
import { onlyCommands, onlyViewActions } from '../../src/middleware/builtin';

const app = new App({ token: 'TOKEN', signingSecret: 'Signing Secret' });

// Ensure you can use some of the built-in middleware as global middleware
// https://github.com/slackapi/bolt-js/issues/911
app.use(onlyViewActions);
app.use(onlyCommands);
app.use(async ({ ack, next }) => {
  if (ack) {
    await ack();
    return;
  }
  await next();
});

interface MyContext {
  doesnt: 'matter';
}
// Ensure custom context assigned to individual middleware is honoured
app.use<MyContext>(async ({ context }) => {
  expectAssignable<MyContext>(context);
});

// Ensure custom context assigned to the entire app is honoured
const typedContextApp = new App<MyContext>();
typedContextApp.use(async ({ context }) => {
  expectAssignable<MyContext>(context);
});
