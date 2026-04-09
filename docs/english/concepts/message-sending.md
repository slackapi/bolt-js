# Sending messages

Within your listener function, `say()` is available whenever there is an associated conversation (for example, a conversation where the event or action which triggered the listener occurred). `say()` accepts a string to post simple messages and JSON payloads to send more complex messages. The message payload you pass in will be sent to the associated conversation.

In the case that you'd like to send a message outside of a listener or you want to do something more advanced (like handle specific errors), you can call `chat.postMessage` [using the client attached to your Bolt instance](/tools/bolt-js/concepts/web-api).

```javascript
// Listens for messages containing "knock knock" and responds with an italicized "who's there?"
app.message('knock knock', async ({ message, say }) => {
  await say(`_Who's there?_`);
});
```

## Sending a message with blocks

`say()` accepts more complex message payloads to make it easy to add functionality and structure to your messages.

To explore adding rich message layouts to your app, read through [the guide on our API site](/messaging/#structure) and look through templates of common app flows [in the Block Kit Builder](https://api.slack.com/tools/block-kit-builder?template=1).

```javascript
// Sends a section block with datepicker when someone reacts with a 📅 emoji
app.event('reaction_added', async ({ event, say }) => {
  if (event.reaction === 'calendar') {
    await say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Pick a date for me to remind you',
          },
          accessory: {
            type: 'datepicker',
            action_id: 'datepicker_remind',
            initial_date: '2019-04-28',
            placeholder: {
              type: 'plain_text',
              text: 'Select a date',
            },
          },
        },
      ],
    });
  }
});
```

## Streaming messages {#streaming-messages}

You can have your app's messages stream in to replicate conventional agent behavior. Bolt for JavaScript provides a `sayStream` utility as a listener argument available for `app.event` and `app.message` listeners. 

The `sayStream` utility streamlines calling the Node Slack SDK's [`WebClient.chatStream()`](/tools/node-slack-sdk/reference/web-api/classes/WebClient#chatstream) helper utility by sourcing parameter values from the relevant event payload.

| Parameter | Value |
|---|---| 
| `channel_id` | Sourced from the event payload.
| `thread_ts` | Sourced from the event payload. Falls back to the `ts` value if available.
| `recipient_team_id` | Sourced from the event `team_id` (`enterprise_id` if the app is installed on an org).
| `recipient_user_id` | Sourced from the `user_id` of the event.

If neither a `channel_id` or `thread_ts` can be sourced, then the utility will be `None`.
---

```js
import { App, LogLevel } from '@slack/bolt';
import 'dotenv/config';


const app = new App({
token: process.env.SLACK_BOT_TOKEN,
socketMode: true,
appToken: process.env.SLACK_APP_TOKEN,
logLevel: LogLevel.DEBUG,
});

app.event('app_mention', async ({ sayStream, setStatus }) => {
  setStatus({
    status: 'Thinking...',
    loading_messages: ['Waking up...', 'Loading a witty response...'],
  });
  const stream = sayStream({ buffer_size: 100 });
  await stream.append({ markdown_text: 'Thinking... :thinking_face:\n\n' });
  await stream.append({ markdown_text: 'Here is my response!' });
  await stream.stop({ blocks: [feedbackBlock] });
});

(async () => {
try {
  await app.start(process.env.PORT || 3000);
  app.logger.info('Bolt app is running!');
} catch (error) {
  app.logger.error('Unable to start App', error);
}
})();
```

#### Adding feedback buttons after a stream

You can pass a [feedback buttons](/reference/block-kit/block-elements/feedback-buttons-element) block element to `stream.stop` to provide feedback buttons to the user at the bottom of the message. Interaction with these buttons will send a block action event to your app to receive the feedback.

```js
const feedbackBlock = {
  type: 'context_actions',
  elements: [
    {
      type: 'feedback_buttons',
      action_id: 'feedback',
      positive_button: {
        text: { type: 'plain_text', text: 'Good Response' },
        accessibility_label: 'Submit positive feedback on this response',
        value: 'good-feedback',
      },
      negative_button: {
        text: { type: 'plain_text', text: 'Bad Response' },
        accessibility_label: 'Submit negative feedback on this response',
        value: 'bad-feedback',
      },
    },
  ],
};
```

Read more about streaming messages in the [_Adding agent features_](/tools/bolt-js/adding-agent-features) guide.
