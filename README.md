# Bolt ![Bolt logo](docs/assets/bolt-logo.svg) for JavaScript

[![Build Status](https://travis-ci.org/slackapi/bolt-js.svg?branch=master)](https://travis-ci.org/slackapi/bolt-js)
[![codecov](https://codecov.io/gh/slackapi/bolt/branch/master/graph/badge.svg)](https://codecov.io/gh/slackapi/bolt-js)

A JavaScript framework to build Slack apps in a flash with the latest platform features. Read the [getting started guide](https://slack.dev/bolt-js/tutorial/getting-started) to quickly setup and run your first Bolt app.

Read [the documentation](https://slack.dev/bolt-js) to explore the basic and advanced concepts of Bolt for JavaScript.

## Setup

```bash
npm install @slack/bolt

# Or with yarn
yarn add @slack/bolt
```

## Initialization

Create an app by calling the constructor, which is a top-level export.

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

> ⚙️ By default, Bolt will listen to the `/slack/events` endpoint of your public URL for all incoming requests (whether shortcuts, events, or interactivity payloads). When configuring Request URLs in your app configuration, they should all have `/slack/events` appended by default. You can modify the default behavior using the endpoints parameter in the App constructor. This option can be set to a string, or an array of strings, of the paths to use instead of '/slack/events'.

## Listening for events

Apps typically react to a collection of incoming events, which can be [events](https://api.slack.com/events-api), [actions](hhttps://api.slack.com/interactivity/components), [shortcuts](https://api.slack.com/interactivity/shortcuts), [slash commands](https://api.slack.com/interactivity/slash-commands) or [options requests](https://api.slack.com/reference/block-kit/block-elements#external_select). For each type of
event, there's a method to build a listener function.

```js
// Listen for an event from the Events API
app.event(eventType, fn);

// Convenience method to listen to only `message` events using a string or RegExp
app.message([pattern ,] fn);

// Listen for an action from a Block Kit element (buttons, select menus, date pickers, etc)
app.action(actionId, fn);

// Listen for dialog submissions
app.action({ callback_id: callbackId }, fn);

// Listen for a global or message shortcuts
app.shortcut(callbackId, fn);

// Listen for slash commands
app.command(commandName, fn);

// Listen for view_submission modal events
app.view(callbackId, fn);

// Listen for options requests (from select menus with an external data source)
app.options(actionId, fn);
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
