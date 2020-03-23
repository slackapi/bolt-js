---
title: Sending messages
lang: en
slug: message-sending
order: 2
---

<div class="section-content">
Within your listener function, `say()` is available whenever there is an associated conversation (for example, a conversation where the event or action which triggered the listener occurred). `say()` accepts a string to post simple messages and JSON payloads to send more complex messages. The message payload you pass in will be sent to the associated conversation.

In the case that you'd like to send a message outside of a listener or you want to do something more advanced (like handle specific errors), you can call `chat.postMessage` [using the client attached to your Bolt instance](#web-api).
</div>

```javascript
// Listens for messages containing "knock knock" and responds with an italicized "who's there?"
app.message('knock knock', async ({ message, say }) => {
  await say(`_Who's there?_`);
});
```

<details class="secondary-wrapper">
<summary markdown="0">
<h4 class="secondary-header">Sending a message with blocks</h4>
</summary>

<div class="secondary-content" markdown="0">
`say()` accepts more complex message payloads to make it easy to add functionality and structure to your messages.

To explore adding rich message layouts to your app, read through [the guide on our API site](https://api.slack.com/messaging/composing/layouts) and look through templates of common app flows [in the Block Kit Builder](https://api.slack.com/tools/block-kit-builder?template=1).
</div>

```javascript
// Sends a section block with datepicker when someone reacts with a 📅 emoji
app.event('reaction_added', async ({ event, say }) => {
  if (event.reaction === 'calendar') {
    await say({
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
      }]
    });
  }
});
```
</details>
