---
title: Listening and responding to commands
lang: en
slug: /concepts/commands
---


Your app can use the `command()` method to listen to incoming slash command requests. The method requires a `commandName` of type string or RegExp.

:::warning 

If you use `command()` multiple times with overlapping RegExp matches, _all_ matching listeners will run. Design your regular expressions to avoid this possibility.

:::

Commands must be acknowledged with `ack()` to inform Slack your app has received the request.

There are two ways to respond to slash commands. The first way is to use `say()`, which accepts a string or JSON payload. The second is `respond()` which is a utility for the `response_url`. These are explained in more depth in the [responding to actions](/concepts/action-respond) section.

When configuring commands within your app configuration, you'll continue to append `/slack/events` to your request URL.


```javascript
// The echo command simply echoes on command
app.command('/echo', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();

  await respond(`${command.text}`);
});
```
