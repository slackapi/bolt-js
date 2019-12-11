// tslint:disable:no-implicit-dependencies
import 'mocha';
import { assert } from 'chai';
import { App, ExpressReceiver } from './index';
import serverlessHttp from 'serverless-http';
import {
  delay,
  createMessageEventRequest,
  importAppWithMockSlackClient,
} from './test-helpers';

describe('When being used in testing downstream', () => {
  let app: App;
  let handler: any;
  let request: any;
  const message = 'Hey there!';

  beforeEach(async () => {
    const receiver = new ExpressReceiver({ signingSecret: 'SECRET' });
    const RewiredApp = await importAppWithMockSlackClient();

    app = new RewiredApp({ receiver, token: '' });

    // Undecided on best wrapper - See discussion here https://community.slack.com/archives/CHY642221/p1575577886047900
    // This wrapper should take an event and return a promise with a response when its event loop has completed
    handler = serverlessHttp(receiver.app);

    // example slack event request information to be sent via handler in tests
    request = createMessageEventRequest(message);
  });

  it('correctly waits for async listeners', async () => {
    let changed = false;

    app.message(message, async ({ next }) => {
      await delay(100);
      changed = true;

      next();
    });

    const response = await handler(request);

    assert.equal(response.statusCode, 200);
    assert.isTrue(changed); // Actual `false`, even though changed to `true` in async listener
  });

  it('throws errors which can be caught by downstream async listeners', async () => {
    app.message('Hey', async ({ next }) => {
      const error = new Error('Error handling the message :(');

      next(error); // likely that most 'async' middleware wouldn't do this, but probably should work?

      throw error; // Nothing catches this up the stack, but this is what async middleware is likely doing
    });

    app.error(() => {
      // Never called; middleware should handle its own errors, but a handler can be helpful unexpected errors.
    });

    const response = await handler(request);

    assert.equal(response.statusCode, 500); // Actual 200, even though error was thrown
  });

  it('calls async middleware in declared order', async () => {
    let middlewareCount = 0;

    const assertOrderMiddleware = (order: number) => async ({ next }: any) => {
      await delay(100);
      middlewareCount += 1;
      assert.equal(middlewareCount, order);
      next();
    };

    app.use(assertOrderMiddleware(1));

    app.message(message, assertOrderMiddleware(2), assertOrderMiddleware(3));

    // This middleware is never called; if it detects a message as 'last' it gives a noop instead of a real callback.
    // Discovered this by trying to polyfill bolt sticking a handler here to possibly find when the event loop was done.
    // A real use case would be having a message set a `state` in its context and a handler here saving it to a db
    app.use(assertOrderMiddleware(4));

    await handler(request);

    await delay(600); // This should be removable; without it none of the middleware is called

    assert.equal(middlewareCount, 4); // Actual 3, 4th never called
  });
});
