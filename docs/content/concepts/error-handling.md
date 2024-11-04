---
title: Handling errors
lang: en
slug: /concepts/error-handling
---

:::info

Since v2, error handling has improved! View the [migration guide for V2](/tutorial/migration-v2) to learn about the changes.

:::

If an error occurs in a listener, it’s recommended you handle it directly with a `try`/`catch`. However, there still may be cases where errors slip through the cracks. By default, these errors will be logged to the console. To handle them yourself, you can attach a global error handler to your app with the `app.error(fn)` method.

You can also define more focussed and specific error handlers for a variety of error paths directly on the `HTTPReceiver`:

- `dispatchErrorHandler`: triggered if an incoming request is to an unexpected path.
- `processEventErrorHandler`: triggered when processing a request (i.e. middleware, authorization) throws an exception.
- `unhandledRequestHandler`: triggered when a request from Slack goes unacknowledged.
- `unhandledRequestTimeoutMillis`: the amount of time in milliseconds to wait for request acknowledgement from the application before triggering the `unhandledRequestHandler`. Default is `3001`.

:::info

It is imperative that any custom Error Handlers defined in your app respond to the underlying Slack request that led to the error, using `response.writeHead()` to set the HTTP status code of the response and `response.end()` to dispatch the response back to Slack. See the example for details.

:::

```javascript
import { App, HTTPReceiver } from '@slack/bolt';

const app = new App({
  receiver: new HTTPReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    // more specific, focussed error handlers
    dispatchErrorHandler: async ({ error, logger, response }) => {
      logger.error(`dispatch error: ${error}`);
      response.writeHead(404);
      response.write("Something is wrong!");
      response.end();
    },
    processEventErrorHandler: async ({ error, logger, response }) => {
      logger.error(`processEvent error: ${error}`);
      // acknowledge it anyway!
      response.writeHead(200);
      response.end();
      return true;
    },
    unhandledRequestHandler: async ({ logger, response }) => {
      logger.info('Acknowledging this incoming request because 2 seconds already passed...');
      // acknowledge it anyway!
      response.writeHead(200);
      response.end();
    },
    unhandledRequestTimeoutMillis: 2000, // the default is 3001
  }),
});

// A more generic, global error handler
app.error(async (error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});
```

## Accessing more data in the error handler

There may be cases where you need to log additional data from a request in the global error handler. Or you may simply wish to have access to the `logger` you've passed into Bolt.

Starting with version 3.8.0, when passing `extendedErrorHandler: true` to the constructor, the error handler will receive an object with `error`, `logger`, `context`, and the `body` of the request.

It is recommended to check whether a property exists on the `context` or `body` objects before accessing its value, as the data available in the `body` object differs from event to event, and because errors can happen at any point in a request's lifecycle (i.e. before a certain property of `context` has been set).

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  extendedErrorHandler: true,
});

app.error(async ({ error, logger, context, body }) => {
  // Log the error using the logger passed into Bolt
  logger.error(error);

  if (context.teamId) {
    // Do something with the team's ID for debugging purposes
  }
});
```