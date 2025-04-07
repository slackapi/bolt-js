---
title: Listening to messages
lang: en
slug: /concepts/message-listening
---

To listen to messages that [your app has access to receive](https:///messaging/retrieving#permissions), you can use the `message()` method which filters out events that aren’t of type `message` .A `message()` listener is equivalent to `event('message')`

The `message()` listener accepts an optional `pattern` parameter of type `string` or `RegExp` object which filters out any messages that don’t match the pattern.

```javascript
// This will match any message that contains 👋
app.message(':wave:', async ({ message, say }) => {
  // Handle only newly posted messages here
  if (message.subtype === undefined
    || message.subtype === 'bot_message'
    || message.subtype === 'file_share'
    || message.subtype === 'thread_broadcast') {
    await say(`Hello, <@${message.user}>`);
  }
});
```

## Using a RegExp pattern {#using-regexp}

A RegExp pattern can be used instead of a string for more granular matching.

All of the results of the RegExp match will be in `context.matches`.

```javascript
app.message(/^(hi|hello|hey).*/, async ({ context, say }) => {
  // RegExp matches are inside of context.matches
  const greeting = context.matches[0];

  await say(`${greeting}, how are you?`);
});
```

## Filtering on event subtypes {#filtering-event-subtypes}

You can filter on subtypes of events by using the built-in `subtype()` middleware. Common message subtypes like `message_changed` and `message_replied` can be found [on the message event page](https://docs.slack.dev/reference/events/message#subtypes).

```javascript
// Import subtype from the package
const { App, subtype } = require('@slack/bolt');

// Matches all message changes from users
app.message(subtype('message_changed'), ({ event, logger }) => {
  // This if statement is required in TypeScript code
  if (event.subtype === 'message_changed'
    && !event.message.subtype
    && !event.previous_message.subtype) {
    logger.info(`The user ${event.message.user} changed their message from ${event.previous_message.text} to ${event.message.text}`);
  }
});
```
