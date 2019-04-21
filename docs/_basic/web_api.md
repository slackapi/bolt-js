---
title: Using the Web API
tags: web-api client
slug: web-api
---

<div class="section_content">
You can call any Web API method using the client attached to your Slapp instance under the `client` key (given that your app has the appropriate scopes). This is an instance of theour @slack/web-api client, so you can call a method the same way you would with that package.

The token used to initialize Bolt can be found in the `context` object, which can be helpful when you’re making calls and need to pass the token yourself.
</div>

```javascript
// Epoch for September 30, 2019 11:59:59 PM
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
