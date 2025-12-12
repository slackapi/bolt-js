# Using AI in Apps

The Slack platform offers features tailored for AI agents and assistants. Your apps can [utilize the `Assistant` class](#assistant) for a side-panel view designed with AI in mind, or they can utilize features applicable to messages throughout Slack, like [chat streaming](#text-streaming) and [feedback buttons](#adding-and-handling-feedback).

If you're unfamiliar with using these feature within Slack, you may want to read the [API documentation on the subject](/ai/). Then come back here to implement them with Bolt!

## The `Assistant` class instance {#assistant}

:::info[Some features within this guide require a paid plan]
If you don't have a paid workspace for development, you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.
:::

The [`Assistant`](/tools/bolt-js/reference#the-assistantconfig-configuration-object) class can be used to handle the incoming events expected from a user interacting with an app in Slack that has the Agents & AI Apps feature enabled. 

A typical flow would look like:

1. [The user starts a thread](#handling-new-thread). The `Assistant` class handles the incoming [`assistant_thread_started`](/reference/events/assistant_thread_started) event.
2. [The thread context may change at any point](#handling-thread-context-changes). The `Assistant` class can handle any incoming [`assistant_thread_context_changed`](/reference/events/assistant_thread_context_changed) events. The class also provides a default `context` store to keep track of thread context changes as the user moves through Slack.
3. [The user responds](#handling-user-response). The `Assistant` class handles the incoming [`message.im`](/reference/events/message.im) event. 

```js
const assistant = new Assistant({
  /**
   * (Recommended) A custom ThreadContextStore can be provided, inclusive of methods to
   * get and save thread context. When provided, these methods will override the `getThreadContext`
   * and `saveThreadContext` utilities that are made available in other Assistant event listeners.
   */
  // threadContextStore: {
  //   get: async ({ context, client, payload }) => {},
  //   save: async ({ context, client, payload }) => {},
  // },

  /**
   * `assistant_thread_started` is sent when a user opens the Assistant container.
   * This can happen via DM with the app or as a side-container within a channel.
   */
  threadStarted: async ({ event, logger, say, setSuggestedPrompts, saveThreadContext }) => {},
  
  /**
   * `assistant_thread_context_changed` is sent when a user switches channels
   * while the Assistant container is open. If `threadContextChanged` is not
   * provided, context will be saved using the AssistantContextStore's `save`
   * method (either the DefaultAssistantContextStore or custom, if provided).
   */
  threadContextChanged: async ({ logger, saveThreadContext }) => {},
  
  /**
   * Messages sent from the user to the Assistant are handled in this listener.
   */
  userMessage: async ({ client, context, logger, message, getThreadContext, say, setTitle, setStatus }) => {},
});
```

:::info[Consider the following]
You _could_ go it alone and [listen](/tools/bolt-js/concepts/event-listening) for the `assistant_thread_started`, `assistant_thread_context_changed`, and `message.im` events in order to implement the AI features in your app. That being said, using the `Assistant` class will streamline the process. And we already wrote this nice guide for you!
:::

While the `assistant_thread_started` and `assistant_thread_context_changed` events do provide Slack-client thread context information, the `message.im` event does not. Any subsequent user message events won't contain thread context data. For that reason, Bolt not only provides a way to store thread context — the `threadContextStore` property — but it also provides a `DefaultThreadContextStore` instance that is utilized by default. This implementation relies on storing and retrieving [message metadata](/messaging/message-metadata/) as the user interacts with the app. 

If you do provide your own `threadContextStore` property, it must feature `get` and `save` methods.

:::tip[Be sure to give the [reference docs](/tools/bolt-js/reference#agents--assistants) a look!]
:::

### Configuring your app to support the `Assistant` class

1. Within [App Settings](https://api.slack.com/apps), enable the **Agents & AI Apps** feature.

2. Within the App Settings **OAuth & Permissions** page, add the following scopes: 
  * [`assistant:write`](/reference/scopes/assistant.write)
  * [`chat:write`](/reference/scopes/chat.write)
  * [`im:history`](/reference/scopes/im.history)

3. Within the App Settings **Event Subscriptions** page, subscribe to the following events: 
  * [`assistant_thread_started`](/reference/events/assistant_thread_started)
  * [`assistant_thread_context_changed`](/reference/events/assistant_thread_context_changed)
  * [`message.im`](/reference/events/message.im)

### Handling a new thread {#handling-new-thread}

When the user opens a new thread with your AI-enabled app, the [`assistant_thread_started`](/reference/events/assistant_thread_started) event will be sent to your app. Capture this with the `threadStarted` handler to allow your app to respond. 

In the example below, the app is sending a message — containing thread context [message metadata](/messaging/message-metadata/) behind the scenes — to the user, along with a single [prompt](/reference/methods/assistant.threads.setSuggestedPrompts).

```js
...
threadStarted: async ({ event, logger, say, setSuggestedPrompts, saveThreadContext }) => {
    const { context } = event.assistant_thread;

    try {
      /**
       * Since context is not sent along with individual user messages, it's necessary to keep
       * track of the context of the conversation to better assist the user. Sending an initial
       * message to the user with context metadata facilitates this, and allows us to update it
       * whenever the user changes context (via the `assistant_thread_context_changed` event).
       * The `say` utility sends this metadata along automatically behind the scenes.
       * !! Please note: this is only intended for development and demonstrative purposes.
       */
      await say('Hi, how can I help?');

      await saveThreadContext();

      /**
       * Provide the user up to 4 optional, preset prompts to choose from.
       *
       * The first `title` prop is an optional label above the prompts that
       * defaults to 'Try these prompts:' if not provided.
       */
      if (!context.channel_id) {
        await setSuggestedPrompts({
          title: 'Start with this suggested prompt:',
          prompts: [
            {
              title: 'This is a suggested prompt',
              message:
                'When a user clicks a prompt, the resulting prompt message text ' +
                'can be passed directly to your LLM for processing.\n\n' +
                'Assistant, please create some helpful prompts I can provide to ' +
                'my users.',
            },
          ],
        });
      }

      /**
       * If the user opens the Assistant container in a channel, additional
       * context is available. This can be used to provide conditional prompts
       * that only make sense to appear in that context.
       */
      if (context.channel_id) {
        await setSuggestedPrompts({
          title: 'Perform an action based on the channel',
          prompts: [
            {
              title: 'Summarize channel',
              message: 'Assistant, please summarize the activity in this channel!',
            },
          ],
        });
      }
    } catch (e) {
      logger.error(e);
    }
  },
...
```

:::tip[When a user opens an app thread while in a channel, the channel info is stored as the thread's `AssistantThreadContext` data.] 

You can grab that info using the `getThreadContext()` utility, as subsequent user message event payloads won't include the channel info. 
:::

### Handling thread context changes {#handling-thread-context-changes}

When the user switches channels, the [`assistant_thread_context_changed`](/reference/events/assistant_thread_context_changed) event will be sent to your app. Capture this with the `threadContextChanged` handler.

```js
...
  threadContextChanged: async ({ saveThreadContext }) => {
    await saveThreadContext();
  },
...
```

If you use the built-in `AssistantThreadContextStore` without any custom configuration, you can skip this — the updated thread context data is automatically saved as [message metadata](/messaging/message-metadata/) on the first reply from the app.

### Handling the user response {#handling-user-response}

When the user messages your app, the [`message.im`](/reference/events/message.im) event will be sent to your app. Capture this with the `userMessage` handler. 

Messages sent to the app do not contain a [subtype](/reference/events/message/#subtypes) and must be deduced based on their shape and any provided [message metadata](/messaging/message-metadata/).

There are three [utilities](/tools/bolt-js/reference#the-assistantconfig-configuration-object) that are particularly useful in curating the user experience:
* `say`
* `setTitle`
* `setStatus`

Within the `setStatus` utility, you can cycle through strings passed into a `loading_messages` array.


```js
// LLM system prompt
const DEFAULT_SYSTEM_CONTENT = `You're an assistant in a Slack workspace.
Users in the workspace will ask you to help them write something or to think better about a specific topic.
You'll respond to those questions in a professional way.
When you include markdown text, convert them to Slack compatible ones.
When a prompt has Slack's special syntax like <@USER_ID> or <#CHANNEL_ID>, you must keep them as-is in your response.`;
...
const assistant = new Assistant({
  ...
  userMessage: async ({ client, context, logger, message, getThreadContext, say, setTitle, setStatus }) => {
    /**
     * Messages sent to the Assistant can have a specific message subtype.
     *
     * Here we check that the message has "text" and was sent to a thread to
     * skip unexpected message subtypes.
     */
    if (!('text' in message) || !('thread_ts' in message) || !message.text || !message.thread_ts) {
      return;
    }
    const { channel, thread_ts } = message;
    const { userId, teamId } = context;

    try {
      /**
       * Set the title of the Assistant thread to capture the initial topic/question
       * as a way to facilitate future reference by the user.
       */
      await setTitle(message.text);

      /**
       * Set the status of the Assistant to give the appearance of active processing.
       */
      await setStatus({
        status: 'thinking...',
        loading_messages: [
          'Teaching the hamsters to type faster…',
          'Untangling the internet cables…',
          'Consulting the office goldfish…',
          'Polishing up the response just for you…',
          'Convincing the AI to stop overthinking…',
        ],
      });
```

The following example uses OpenAI but you can substitute it with the LLM provider of your choice.

```js 
      ...
      // Retrieve the Assistant thread history for context of question being asked
      const thread = await client.conversations.replies({
        channel,
        ts: thread_ts,
        oldest: thread_ts,
      });

      // Prepare and tag each message for LLM processing
      const threadHistory = thread.messages.map((m) => {
        const role = m.bot_id ? 'Assistant' : 'User';
        return `${role}: ${m.text || ''}`;
      });
      // parsed threadHistory to align with openai.responses api input format
      const parsedThreadHistory = threadHistory.join('\n');

      // Send message history and newest question to LLM
      const llmResponse = await openai.responses.create({
        model: 'gpt-4o-mini',
        input: `System: ${DEFAULT_SYSTEM_CONTENT}\n\n${parsedThreadHistory}\nUser: ${message.text}`
      });

      // Provide a response to the user
      await say({ markdown_text: llmResponse.choices[0].message.content });
    } catch (e) {
      logger.error(e);

      // Send message to advise user and clear processing status if a failure occurs
      await say({ text: 'Sorry, something went wrong!' });
    }
  },
});

app.assistant(assistant);
...
```

## Text streaming in messages {#text-streaming}

Three Web API methods work together to provide users a text streaming experience: 

* the [`chat.startStream`](/reference/methods/chat.startStream) method starts the text stream, 
* the [`chat.appendStream`](/reference/methods/chat.appendStream) method appends text to the stream, and 
* the [`chat.stopStream`](/reference/methods/chat.stopStream) method stops it.

Since you're using Bolt for JS, built upon the Node Slack SDK, you can use the [`chatStream()`](/tools/node-slack-sdk/reference/web-api/classes/WebClient#chatstream) utility to streamline all three aspects of streaming in your app's messages.

The following example uses OpenAI's streaming API with the new `chatStream` functionality, but you can substitute it with the AI client of your choice.

```js
...
      // Send message history and newest question to LLM
      const llmResponse = await openai.responses.create({
        model: 'gpt-4o-mini',
        input: `System: ${DEFAULT_SYSTEM_CONTENT}\n\n${parsedThreadHistory}\nUser: ${message.text}`,
        stream: true,
      });

      const streamer = client.chatStream({
        channel: channel,
        recipient_team_id: teamId,
        recipient_user_id: userId,
        thread_ts: thread_ts,
      });

      for await (const chunk of llmResponse) {
        if (chunk.type === 'response.output_text.delta') {
          await streamer.append({
            markdown_text: chunk.delta,
          });
        }
      }
      await streamer.stop();
    } catch (e) {
      logger.error(e);

      // Send message to advise user and clear processing status if a failure occurs
      await say({ text: `Sorry, something went wrong! ${e}` });
    }
  },
});
...
```

## Adding and handling feedback

Use the [feedback buttons block element](/reference/block-kit/block-elements/feedback-buttons-element/) to allow users to immediately provide feedback regarding your app's responses. Here's a quick example:

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

Use the `chatStream` utility to render the feedback block at the bottom of your app's message.

```js
...
// Provide a response to the user
const streamer = client.chatStream({
  channel: channel,
  recipient_team_id: teamId,
  recipient_user_id: userId,
  thread_ts: thread_ts,
});

// Feed-in stream from LLM
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
...
```

Then add a response for when the user provides feedback.

```js
/**
 * Handle feedback button interactions
 */
app.action('feedback', async ({ ack, body, client, logger }) => {
  try {
    await ack();

    if (body.type !== 'block_actions') {
      return;
    }

    const message_ts = body.message.ts;
    const channel_id = body.channel.id;
    const user_id = body.user.id;

    const feedback_type = body.actions[0];
    if (!('value' in feedback_type)) {
      return;
    }

    const is_positive = feedback_type.value === 'good-feedback';
    if (is_positive) {
      await client.chat.postEphemeral({
        channel: channel_id,
        user: user_id,
        thread_ts: message_ts,
        text: "We're glad you found this useful.",
      });
    } else {
      await client.chat.postEphemeral({
        channel: channel_id,
        user: user_id,
        thread_ts: message_ts,
        text: "Sorry to hear that response wasn't up to par :slightly_frowning_face: Starting a new chat may help with AI mistakes and hallucinations.",
      });
    }
  } catch (error) {
    logger.error(`:warning: Something went wrong! ${error}`);
  }
});
```

## Full example: App Agent Template

Want to see all the functionality described above in action? We've created a [App Agent Template](https://github.com/slack-samples/bolt-js-assistant-template) repo for you to build off of.
