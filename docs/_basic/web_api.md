---
title: Using the Web API
lang: en
slug: web-api
order: 4
---

<div class="section-content">
You can call [any Web API method](https://api.slack.com/methods) using the [`WebClient`](https://slack.dev/node-slack-sdk/web-api) provided to your Bolt app as `app.client` (given that your app has the appropriate scopes). When you call one the client's methods, it returns a Promise containing the response from Slack.

The token used to initialize Bolt can be found in the `context` object, which is required for most Web API methods.
</div>

```javascript
// Unix Epoch time for September 30, 2019 11:59:59 PM
const whenSeptemberEnds = 1569887999;

app.message('wake me up', async ({ message, context }) => {
  try {
    // Call the chat.scheduleMessage method with a token
    const result = await app.client.chat.scheduleMessage({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      channel: message.channel.id,
      post_at: whenSeptemberEnds,
      text: 'Summer has come and passed'
    });
  }
  catch (error) {
    console.error(error);
  }
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">Reacting to messages</h4>
</summary>

<div class="secondary-content" markdown="0">
You can add emoji reactions to the message you are listening to using the `reactions.add()` method available at the `app.client` context.
</div>

```javascript
// Reacts to "I like you" messages with a heart emoji
app.message('I like you', async ({ message, context }) => {
  try {
  const result = await app.client.reactions.add({
    token: context.botToken,
    name: 'heart',
    channel: message.channel,
    timestamp: message.ts
  });
  }
  catch (error) {
    console.log(error);
  }
});
```

</details>
