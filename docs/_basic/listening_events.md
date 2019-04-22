---
title: Listening to events
slug: event-listening
order: 4
---

<div class="section-content">
You can listen to [any Events API event](https://api.slack.com/events) using the `event()` method. This allows your app to take action when something happens in Slack, like a user reacting to a message or joining a channel.

The `event()` method requires an `eventType` of type string.
</div>

```javascript
const welcomeChannelId = 'C12345';

app.event('team_join', async ({ event, context }) => {
  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user.id}>! 🎉 You can introduce yourself in this channel.`
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});
```

<details markdown="0">
<summary class="section-head">
<h4 class="section-head">Filtering on event subtypes</h4>
</summary>

<div class="secondary-wrapper">

<div class="secondary-content">
You can filter on subtypes of events by using the built-in `matchEventSubtype()` middleware. Common message subtypes like `bot_message` and `message_replied` can be found [on the message event page](https://api.slack.com/events/message#message_subtypes).
</div>

```javascript
// event('message') is the same as message()
app.event('message', matchEventSubtype('bot_message'), async ({ event }) => {
  console.log(`The bot user ${event.user} said ${event.text}`);
});
```

</div>
</details>
