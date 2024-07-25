---
title: Listening to events
lang: en
slug: /concepts/event-listening
---


You can listen to [any Events API event](https://api.slack.com/events) using the `event()` method after subscribing to it in your app configuration. This allows your app to take action when something happens in Slack, like a user reacting to a message or joining a channel.

The `event()` method requires an `eventType` of type string.


```javascript
const welcomeChannelId = 'C12345';

// When a user joins the team, send a message in a predefined channel asking them to introduce themselves
app.event('team_join', async ({ event, client, logger }) => {
  try {
    // Call chat.postMessage with the built-in client
    const result = await client.chat.postMessage({
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user.id}>! 🎉 You can introduce yourself in this channel.`
    });
    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});
```

<details class="secondary-wrapper" >
<summary>
Filtering on message subtypes
</summary>


A `message()` listener is equivalent to `event('message')`

You can filter on subtypes of events by using the built-in `subtype()` middleware. Common message subtypes like `message_changed` and `message_replied` can be found [on the message event page](https://api.slack.com/events/message#message_subtypes).


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

</details>
