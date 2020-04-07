# Bolt ![Bolt logo](docs/assets/bolt-logo.svg) for JavaScript

[![Build Status](https://travis-ci.org/slackapi/bolt.svg?branch=master)](https://travis-ci.org/slackapi/bolt)
[![codecov](https://codecov.io/gh/slackapi/bolt/branch/master/graph/badge.svg)](https://codecov.io/gh/slackapi/bolt)

A JavaScript framework to build Slack apps in a flash with the latest platform features.

## Initialization

Create an app by calling a constructor, which is a top-level export.

```js
const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

/* Add functionality here */

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

## Listening for events

Apps typically react to incoming events, which can be events, actions, commands, or options requests. For each type of
event, there's a method to attach a listener function.

```js
// Listen for an event from the Events API
app.event(eventType, fn);

// Listen for an action from a block element (buttons, menus, etc)
app.action(actionId, fn);

// Listen for dialog submission, or legacy action
app.action({ callback_id: callbackId }, fn);

// Listen for a global shortcut, or message shortcut
app.shortcut(callbackId, fn);

// Listen for modal view requests
app.view(callbackId, fn);

// Listen for a slash command
app.command(commandName, fn);

// Listen for options requests (from menus with an external data source)
app.options(actionId, fn);
```

There's a special method that's provided as a convenience to handle Events API events with the type `message`. Also, you
can include a string or RegExp `pattern` before the listener function to only call that listener function when the
message text matches that pattern.

```js
app.message([pattern ,] fn);
```

## Making things happen

Most of the app's functionality will be inside listener functions (the `fn` parameters above). These functions are
called with arguments that make it easy to build a rich app.

*  `payload` (aliases: `message`, `event`, `action`, `command`, `options`) - The contents of the event. The
   exact structure will depend on which kind of event this listener is attached to. For example, for an event from the
   Events API, it will the [event type structure](https://api.slack.com/events-api#event_type_structure) (the portion
   inside the event envelope). For a block action or legacy action, it will be the action inside the `actions` array.
   The same object will also be available with the specific name for the kind of payload it is. For example, for an
   event from a block action, you can use the `payload` and `action` arguments interchangeably. **The easiest way to
   understand what's in a payload is to simply log it**, or otherwise [use TypeScript](#using-typescript).

*  `say` - A function to respond to an incoming event. This argument is only available when the listener is triggered
   for event that contains a `channel_id` (including `message` events). Call this function to send a message back to the
   same channel as the incoming event. It accepts both simple strings (for plain messages) and objects (for complex
   messages, including blocks or attachments). `say` returns a promise that will resolve with a
   [response](https://api.slack.com/methods/chat.postMessage) from `chat.postMessage`.

*  `ack` - A function to acknowledge that an incoming event was received by the app. Incoming events from actions,
   commands, and options requests **must** be acknowledged by calling this function. See [acknowledging
   events](#acknowledging-events) for details. `ack` returns a promise that resolves when complete.

*  `respond` - A function to respond to an incoming event. This argument is only available when the listener is
   triggered for an event that contains a `response_url` (actions and commands). Call this function to send a message
   back to the same channel as the incoming event, but using the semantics of the `response_url`. `respond`
   returns a promise that resolves with the results of responding using the `response_url`.

*  `context` - The event context. This object contains data about the message and the app, such as the `botId`.
   See [advanced usage](#advanced-usage) for more details.

*  `body` - An object that contains the whole body of the event, which is a superset of the data in `payload`. Some
   types of data are only available outside the event payload itself, such as `api_app_id`, `authed_users`, etc. This
   argument should rarely be needed, but for completeness it is provided here.

The arguments are grouped into properties of one object, so that it's easier to pick just the ones your listener needs
(using
[object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter)).
Here is an example where the app sends a simple response, so there's no need for most of these arguments:

```js
// Reverse all messages the app can hear
app.message(async ({ message, say }) => {
  const reversedText = message.text.split('').reverse().join('');
  await say(reversedText);
});
```

### Calling the Web API

Listeners can use the full power of all the methods in the Web API (given that your app is installed with the
appropriate scopes). Each app has a `client` property that can be used to call methods. Your listener may read the app's
token from the `context` argument, and use it as the `token` argument for a method call. See the [`WebClient`
documentation](https://slack.dev/node-slack-sdk/web-api) for a more complete description of how it can be used.

```js
// React to any message that contains "happy" with a 😀
app.message('happy', async ({ message, context }) => {
  try {
    // Call the "reactions.add" Web API method
    const result = await app.client.reactions.add({
      // Use token from context
      token: context.botToken,
      name: 'grinning',
      channel: message.channel,
      timestamp: message.ts
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
});
```

### Acknowledging events

Some types of events need to be acknowledged in order to ensure a consistent user experience inside the Slack client
(web, mobile, and desktop apps). This includes all actions, commands, and options requests. Listeners for these events
need to call the `ack()` function, which is passed in as an argument.

In general, the Slack platform expects an acknowledgement within 3 seconds, so listeners should call this function as
soon as possible.

Depending on the type of incoming event a listener is meant for, `ack()` should be called with a parameter:

*  Block actions, global shortcuts, and message shortcuts: Call `ack()` with no parameters.

*  Dialog submissions: Call `ack()` with no parameters when the inputs are all valid, or an object describing the
   validation errors if any inputs are not valid.

*  Options requests: Call `ack()` with an object containing the options for the user to see.

*  Legacy message button clicks, menu selections, and slash commands: Either call `ack()` with no parameters, a `string`
   to to update the message with a simple message, or an `object` to replace it with a complex message. Replacing the
   message to remove the interactive elements is a best practice for any action that should only be performed once.

The following is an example of acknowledging a dialog submission:

```js
app.action({ callbackId: 'my_dialog_callback' }, async ({ action, ack }) => {
  // Expect the ticketId value to begin with "CODE"
  if (action.submission.ticketId.indexOf('CODE') !== 0) {
    await ack({
      errors: [{
        name: 'ticketId',
        error: 'This value must begin with CODE',
      }],
    });
    return;
  }
  await ack();

  // Do some work
});
```

## Handling errors

If an error occurs in a listener function, it's strongly recommended to handle it directly. There are a few cases where
those errors may occur after your listener function has returned (such as when calling `say()` or `respond()`, or
forgetting to call `ack()`). In these cases, your app will be notified about the error in an error handler function.
Your app should register an error handler using the `App#error(fn)` method.

```js
app.error((error) => {
  // Check the details of the error to handle special cases (such as stopping the app or retrying the sending of a message)
  console.error(error);
});
```

If you do not attach an error handler, the app will log these errors to the console by default.

The `app.error()` method should be used as a last resort to catch errors. It is always better to deal with errors in the
listeners where they occur because you can use all the context available in that listener.

## Advanced usage

Apps are designed to be extensible using a concept called **middleware**. Middleware allow you to define how to process
a whole set of events before (and after) the listener function is called. This makes it easier to deal with common
concerns in one place (e.g. authentication, logging, etc) instead of spreading them out in every listener.

In fact, middleware can be _chained_ so that any number of middleware functions get a chance to run before the listener,
and they each run in the order they were added to the chain.

Middleware are just functions - nearly identical to listener functions. They can choose to respond right away, to extend
the `context` argument and continue, or trigger an error. The only difference is that middleware use a special `next`
argument, a function that's called to let the app know it can continue to the next middleware (or listener) in the
chain.

There are two types of middleware: global and listener. Each are explained below.

### Global middleware

Global middleware are used to deal with app-wide concerns, where every incoming event should be processed. They are
added to the chain using `app.use(middleware)`. You can add multiple middleware, and each of them will run in order
before any of the listener middleware, or the listener functions run.

As an example, let's say your app can only work if the user who sends any incoming message is identified using an
internal authentication service (e.g. an SSO provider, LDAP, etc). Here is how you might define a global middleware to
make that data available to each listener.

```js
const { App } = require('@slack/bolt');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

// Add the authentication global middleware
app.use(authWithAcme);

// The listener now has access to the user details
app.message('whoami', async ({ say, context }) => { await say(`User Details: ${JSON.stringify(context.user)}`) });

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

// Authentication middleware - Calls Acme identity provider to associate the incoming event with the user who sent it
// It's a function just like listeners, but it also uses the next argument
async function authWithAcme({ payload, context, say, next }) {
  const slackUserId = payload.user;

  try {
    // Assume we have a function that can take a Slack user ID as input to find user details from the provider
    const user = await acme.lookupBySlackId(slackUserId);
      
    // When the user lookup is successful, add the user details to the context
    context.user = user;
  } catch (error) {
    if (error.message === 'Not Found') {
        // In the real world, you would need to check if the say function was defined, falling back to the respond
        // function if not, and then falling back to only logging the error as a last resort.
        await say(`I'm sorry <@${slackUserId}>, you aren't registered with Acme. Please use <https://acme.com/register> to use this app.`);
        return;
    }
    
    // This middleware doesn't know how to handle any other errors. 
    // Pass control to the previous middleware (if there are any) or the global error handler.
    throw error;
  }
  
  // Pass control to the next middleware (if there are any) and the listener functions
  // Note: You probably don't want to call this inside a `try` block, or any middleware
  //       after this one that throws will be caught by it. 
  await next();
}
```

### Listener middleware

Listener middleware are used to deal with shared concerns amongst many listeners, but not necessarily for all of them.
They are added as arguments that precede the listener function in the call that attaches the listener function. This
means the methods described in [Listening for events](#listening-for-events) are actually all variadic (they take any
number of parameters). You can add as many listener middleware as you like.

As an example, let's say your listener only needs to deal with messages from humans. Messages from apps will always have
a subtype of `bot_message`. We can write a middleware that excludes bot messages, and use it as a listener middleware
before the listener attached to `message` events:

```js
// Listener middleware - filters out messages that have subtype 'bot_message'
async function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
  }
}

// The listener only sees messages from human users
app.message(noBotMessages, ({ message }) => console.log(
  `(MSG) User: ${message.user}
         Message: ${message.text}`
));
```

Message subtype matching is common, so Bolt for JavaScript ships with a builtin listener middleware that filters all messages that
match a given subtype. The following is an example of the opposite of the one above - the listener only sees messages
that _are_ `bot_message`s.

```js
const { App, subtype } = require('@slack/bolt');

// Not shown: app initialization and start

// The listener only sees messages from bot users (apps)
app.message(subtype('bot_message'), ({ message }) => console.log(
  `(MSG) Bot: ${message.bot_id}
         Message: ${message.text}`
));
```

### Even more advanced usage

The examples above all illustrate how middleware can be used to process an event _before_ the listener (and other
middleware in the chain) run. However, middleware can be designed to process the event _after_ the listener finishes.
In general, a middleware can run both before and after the remaining middleware chain.

How you use `next` can
have four different effects:

* **To both preprocess and post-process events** - You can choose to do work both _before_ listener functions by putting code
  before `await next()` and _after_ by putting code after `await next()`. `await next()` passes control down the middleware
  stack in the order it was defined, then back up it in reverse order.

* **To throw an error** - If you don't want to handle an error in a listener, or want to let an upstream listener
  handle it, you can simply **not** call `await next()` and `throw` an `Error`.

* **To handle mid-processing errors** - While not commonly used, as `App#error` is essentially a global version of this,
  you can catch any error of any downstream middleware by surrounding `await next()` in a `try-catch` block.

* **To break the middleware chain** - You can stop middleware from progressing by simply not calling `await next()`.
  By it's nature, throwing an error tends to be an example of this as code after a throw isn't executed.

The following example shows a global middleware that calculates the total processing time for the middleware chain by
calculating the time difference from before the listener and after the listener:

```js
async function logProcessingTime({ next }) {
  const startTimeMs = Date.now();
  
  await next();
  
  const endTimeMs = Date.now();
  console.log(`Total processing time: ${endTimeMs - startTimeMs}`);
}

app.use(logProcessingTime)
```

The next example shows a series of global middleware where one generates an error
and the other handles it.

```js
app.use(async ({ next, say }) => {
  try {
    await next();
  } catch (error) {
    if (error.message === 'channel_not_found') {
      // Handle known errors
      await say('It appears we can't access that channel')
    } else {
      // Rethrow for an upstream error handler
      throw error;
    }
  }
})

app.use(async () => {
  throw new Error('channel_not_found')
})

app.use(async () => {
  // This never gets called as the middleware above never calls next
})
```
