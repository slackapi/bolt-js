---
title: Adding context
lang: en
slug: /concepts/context
---

All listeners have access to a `context` object, which can be used to enrich requests with additional information. For example, perhaps you want to add user information from a third party system or add temporary state for the next middleware in the chain.

`context` is just an object, so you can add to it by setting it to a modified version of itself.

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

app.command('/request', addTimezoneContext, async ({ command, ack, client, context, logger }) => {
  // Acknowledge command request
  await ack();
  // Get local hour of request
  const localHour = (Date.UTC(2020, 3, 31) + context.tz_offset).getHours();

  // Request channel ID
  const requestChannel = 'C12345';

  const requestText = `:large_blue_circle: *New request from <@${command.user_id}>*: ${command.text}`;

  // If request not in between 9AM and 5PM, send request tomorrow
  if (localHour > 17 || localHour < 9) {
    // Assume function exists to get local tomorrow 9AM from offset
    const localTomorrow = getLocalTomorrow(context.tz_offset);

    try {
      // Schedule message
      const result = await client.chat.scheduleMessage({
        channel: requestChannel,
        text: requestText,
        post_at: localTomorrow
      });
    }
    catch (error) {
      logger.error(error);
    }
  } else {
    try {
      // Post now
      const result = await client.chat.postMessage({
        channel: requestChannel,
        text: requestText
      });
    } catch (error) {
      logger.error(error);
    }
  }
});
```
