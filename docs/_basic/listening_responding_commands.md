---
title: Listening and responding to commands
slug: commands
order: 8
---

<div class="section-content">
Your app can use the `command()` method to listen to incoming slash command payloads. The method requires a `commandName` of type string that matches the incoming command name.

Similar to actions, there are two ways to respond to slash command requests. The first way is to use `say()`, which accepts a string or JSON payload. The second is `respond()` which uses the `response_url`.
</div>

```javascript
// The echo command simply echoes on command
app.command('/echo', async ({ command, say }) => {
  say(`${command.text}`);
});
```