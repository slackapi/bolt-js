---
title: Using the Web API
slug: web-api
order: 3
---

<div class="section-content">
You can call [any Web API method](https://api.slack.com/methods) using the client attached to your Bolt instance under the `client` key (given that your app has the appropriate scopes). When you call one of the methods on the `client`, it will return a promise containing the response from Slack.

The token used to initialize Bolt can be found in the `context` object, which can be helpful when you’re making calls and need to pass the token yourself.
</div>

```javascript
// Unix Epoch time for September 30, 2019 11:59:59 PM
const whenSeptemberEnds = 1569887999;

app.message('wake me up', async ({ message, context }) => {
  try {
    // Call the chat.scheduleMessage method
    const result = await app.client.chat.scheduleMessage({
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
