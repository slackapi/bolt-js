---
title: Adding context
lang: en
slug: context
order: 7
---

<div class="section-content">
All listeners have access to a `context` object, which can be used to enrich events with additional information. For example, perhaps you want to add user information from a third party system or add temporary state for the next middleware in the chain.

`context` is just an object, so you can add to it by setting it to a modified version of itself.
</div>

```javascript
async function addTimezoneContext({ payload, client, context, next }) {
  const user = await client.users.info({
    user: payload.user_id,
    include_locale: true
  });

  // Add user's timezone context
  context.tz_offset = user.tz_offset;

  // Pass control to the next middleware function
  await next();
}

app.command('request', addTimezoneContext, async ({ command, ack, client, context }) => {
  // Acknowledge command request
  await ack();
  // Get local hour of request
  const local_hour = (Date.UTC() + context.tz_offset).getHours();

  // Request channel ID
  const requestChannel = 'C12345';

  const requestText = `:large_blue_circle: *New request from <@${command.user_id}>*: ${command.text}`;

  // If request not inbetween 9AM and 5PM, send request tomorrow
  if (local_hour > 17 || local_hour < 9) {
    // Assume function exists to get local tomorrow 9AM from offset
    const local_tomorrow = getLocalTomorrow(context.tz_offset);

    try {
      // Schedule message
      const result = await client.chat.scheduleMessage({
        channel: requestChannel,
        text: requestText,
        post_at: local_tomorrow
      });
    }
    catch (error) {
      console.error(error);
    }
  } else {
    try {
      // Post now
      const result = client.chat.postMessage({
        channel: requestChannel,
        text: requestText
      });
    }
    catch (error) {
      console.error(error);
    }
  }
});
```
