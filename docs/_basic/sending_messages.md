---
title: Sending messages
slug: message-sending
order: 2
---

<div class="section-content">
If you’re using a built-in method (`message()`, `event()`, `action()`, `command()`, or `options()`), `say()` is available to your listener middleware whenever there is an associated channel (the conversation a message was posted in, for example). `say()` accepts a string to post simple text-based messages and JSON payloads to send more complex messages. The message payload you pass in will be sent to the associated channel.

In the case that you aren’t in listener middleware for one of the built-in methods or you want to do something more advanced (like handle specific errors), you can call `chat.postMessage` [using the client attached to your Bolt instance](#web-api).
</div>

```javascript
app.command('bold', async ({ command, say }) => {
  say(`*${command.text}*`);
});
```

<details markdown="0">
<summary>
<h4 class="section-head">Sending a message with blocks</h4>
</summary>

<div class="secondary-wrapper">
<div class="secondary-content" >
`say()` accepts more complex message payloads to make it easy to add functionality and structure to your messages.

To explore adding rich message layouts to your app, read through [the guide on our API site](https://api.slack.com/messaging/composing/layouts) and look through templates of common app flows [in the Block Kit Builder](https://api.slack.com/tools/block-kit-builder?template=1).
</div>

```javascript
// Sends a section block with datepicker when someone reacts with a 📅 emoji
app.event('reaction_added', async ({ event, say }) => {
  if (event.reaction === 'calendar') {
    say({
      blocks: [{
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Pick a date for me to remind you"
          },
          "accessory": {
            "type": "datepicker",
            "action_id": "datepicker_remind",
            "initial_date": "2019-04-28",
            "placeholder": {
              "type": "plain_text",
              "text": "Select a date"
             }
          }
        }]});
  }
});
```

</div>
</details>
