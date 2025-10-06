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

You can have your app's messages stream in to replicate conventional AI chatbot behavior. This is done through three Web API methods:

- [`chat.startStream`](/reference/methods/chat.startstream)
- [`chat.appendStream`](/reference/methods/chat.appendstream)
- [`chat.stopStream`](/reference/methods/chat.stopstream)

The Node Slack SDK provides a [`chatStream()`](/tools/node-slack-sdk/reference/web-api/classes/WebClient#chatstream) helper utility to streamline calling these methods. Here's an excerpt from our [Assistant template app](https://github.com/slack-samples/bolt-js-assistant-template):

```js
// Provide a response to the user
const streamer = client.chatStream({
  channel: channel,
  recipient_team_id: teamId,
  recipient_user_id: userId,
  thread_ts: thread_ts,
});

// response from your LLM of choice; OpenAI is the example here
for await (const chunk of llmResponse) {
  if (chunk.type === 'response.output_text.delta') {
    await streamer.append({
      markdown_text: chunk.delta,
    });
  }
}

// End stream and provide feedback buttons to user
await streamer.stop({ blocks: [feedbackBlock] });
return;
```

In that example, a [feedback buttons](/reference/block-kit/block-elements/feedback-buttons-element) block element is passed to `streamer.stop` to provide feedback buttons to the user at the bottom of the message. Interaction with these buttons will send a block action event to your app to receive the feedback.

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

Read more about streaming messages in the [_Using AI in Apps_](/tools/bolt-js/concepts/ai-apps) guide.
