---
title: Sending messages
tags: message event send
slug: sending-messages
---

<div class="section-content">
If you’re using a built-in method (`message()`, `event()`, `action()`, `command()`, or `options()`), `say()` is available to your listener middleware whenever there is an associated channel (the conversation a message was posted in, for example). `say()` accepts a string to post simple text-based messages and JSON payloads to send more complex messages. The message payload you pass in will be sent to the associated channel.

In the case that you aren’t in listener middleware for one of the built-in methods or you want to do something more advanced (like handle specific errors), you can call `chat.postMessage` using the client attached to your Slapp instance.
</div>

```javascript
app.command('bold', async ({ command, say }) => {
  say(`*${command.text}*`);
});
```

<details>
<summary markdown="0">
<h4 class="section-head">Initializing without a token</h4>
</summary>

<div class="secondary-wrapper" markdown="0">

<div class="secondary-content">
If you’re using a built-in method (`message()`, `event()`, `action()`, `command()`, or `options()`), `say()` is available to your listener middleware whenever there is an associated channel (the conversation a message was posted in, for example). `say()` accepts a string to post simple text-based messages and JSON payloads to send more complex messages. The message payload you pass in will be sent to the associated channel.

In the case that you aren’t in listener middleware for one of the built-in methods or you want to do something more advanced (like handle specific errors), you can call `chat.postMessage` using the client attached to your Slapp instance.
</div>

```javascript
app.command('bold', async ({ command, say }) => {
  say(`*${command.text}*`);
});
```

</div>
</details>

