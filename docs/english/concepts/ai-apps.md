# Using AI in Apps

:::info[Some features within this guide require a paid plan]
If you don't have a paid workspace for development, you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.
:::

The Slack platform offers features tailored for AI agents and assistants. If you're unfamiliar with using these feature within Slack, you may want to read the [API documentation on the subject](/ai/). Then come back here to implement them with Bolt!

## Configuring your app to support AI features

1. Within [App Settings](https://api.slack.com/apps), enable the **Agents & AI Apps** feature.

2. Within the App Settings **OAuth & Permissions** page, add the following scopes: 
  * [`assistant:write`](/reference/scopes/assistant.write)
  * [`chat:write`](/reference/scopes/chat.write)
  * [`im:history`](/reference/scopes/im.history)

3. Within the App Settings **Event Subscriptions** page, subscribe to the following events: 
  * [`assistant_thread_started`](/reference/events/assistant_thread_started)
  * [`assistant_thread_context_changed`](/reference/events/assistant_thread_context_changed)
  * [`message.im`](/reference/events/message.im)

:::info[Consider the following]
You _could_ go it alone and [listen](/tools/bolt-js/concepts/event-listening) for the `assistant_thread_started`, `assistant_thread_context_changed`, and `message.im` events in order to implement the AI features in your app. That being said, using the `Assistant` class will streamline the process. And we already wrote this nice guide for you!
:::

## The `Assistant` class instance

The [`Assistant`](/tools/bolt-js/reference#the-assistantconfig-configuration-object) class can be used to handle the incoming events expected from a user interacting with an app in Slack that has the Agents & AI Apps feature enabled. A typical flow would look like:

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

While the `assistant_thread_started` and `assistant_thread_context_changed` events do provide Slack-client thread context information, the `message.im` event does not. Any subsequent user message events won't contain thread context data. For that reason, Bolt not only provides a way to store thread context — the `threadContextStore` property — but it also provides a `DefaultThreadContextStore` instance that is utilized by default. This implementation relies on storing and retrieving [message metadata](/messaging/message-metadata/) as the user interacts with the app. 

If you do provide your own `threadContextStore` property, it must feature `get` and `save` methods.

:::tip[Be sure to give the [reference docs](/tools/bolt-js/reference#agents--assistants) a look!]
:::

## Handling a new thread {#handling-new-thread}

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

## Handling thread context changes {#handling-thread-context-changes}

When the user switches channels, the [`assistant_thread_context_changed`](/reference/events/assistant_thread_context_changed) event will be sent to your app. Capture this with the `threadContextChanged` handler.

```js
...
  threadContextChanged: async ({ saveThreadContext }) => {
    await saveThreadContext();
  },
...
```

If you use the built-in `AssistantThreadContextStore` without any custom configuration, you can skip this — the updated thread context data is automatically saved as [message metadata](/messaging/message-metadata/) on the first reply from the app.

## Handling the user response {#handling-user-response}

When the user messages your app, the [`message.im`](/reference/events/message.im) event will be sent to your app. Capture this with the `userMessage` handler. 

Messages sent to the app do not contain a [subtype](/reference/events/message/#subtypes) and must be deduced based on their shape and any provided [message metadata](/messaging/message-metadata/).

There are three [utilities](/tools/bolt-js/reference#the-assistantconfig-configuration-object) that are particularly useful in curating the user experience:
* `say`
* `setTitle`
* `setStatus`

Within the `setStatue` utility, you can cycle through strings passed into a `loading_messages` array.


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

### Passing the response to an AI client

The following example uses OpenAI's streaming API with the new `chatStream` functionality, but you can substitute it with the AI client of your choice.


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
        input: `System: ${DEFAULT_SYSTEM_CONTENT}\n\n${parsedThreadHistory}\nUser: ${message.text}`,
        stream: true,
      });
...
```

### Text streaming in messages {#text-streaming}

Three Web API methods work together to provide users a text streaming experience. Use the [`chat.startStream`](/reference/methods/chat.startstream) method to start a text stream, the [`chat.appendStream`](/reference/methods/chat.appendstream) method to append it, and the [`chat.stopStream`](/reference/methods/chat.stopstream) method to stop it. These allow the user to see the response from the LLM as a text stream, rather than a single block of text sent all at once. This provides closer alignment with expected behavior from other major LLM tools.

We've simplified it a bit when using the Bolt framework or Slack SDKs. Use the `streamer` helper to handle all three aspects of streaming in your app's messages.

```js
...
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

### Adding and handling feedback

Use the feedback block to allow users to immediately provide feedback regarding your app's responses. Here's a quick example:

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

Use the streamer helper to render the feedback block at the bottom of your app's message.

```js
...
await streamer.stop({ blocks: [feedbackBlock] });
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

## Full example : App Agent & Assistant Template

Below is the app.js file of the App Agent & Assistant Template repo we've created for you to build off of.

<details>
<summary>View example app</summary>

```js
const { App, LogLevel, Assistant } = require('@slack/bolt');
const { config } = require('dotenv');
const { OpenAI } = require('openai');

config();

// LLM system prompt
const DEFAULT_SYSTEM_CONTENT = `You're an assistant in a Slack workspace.
Users in the workspace will ask you to help them write something or to think better about a specific topic.
You'll respond to those questions in a professional way.
When you include markdown text, convert them to Slack compatible ones.
When a prompt has Slack's special syntax like <@USER_ID> or <#CHANNEL_ID>, you must keep them as-is in your response.`;

/**
 * Feedback buttons to include with messages.
 *
 * @type {import("@slack/bolt").types.ContextActionsBlock}
 */
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

// Initialize the Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
  clientOptions: {
    slackApiUrl: process.env.SLACK_API_URL || 'https://slack.com/api',
  },
});

// Initialize the OpenAI LLM
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * `app_mention` event allows your app to receive message events that directly
 * mention your app. The app must be a member of the channel/conversation to
 * receive the event. Messages in a DM with your app will not dispatch this event,
 * event if the message mentions your app.
 *
 * @see {@link https://docs.slack.dev/reference/events/app_mention/}
 */
app.event('app_mention', async ({ event, client, logger, say }) => {
  try {
    const { channel, text, team, user } = event;
    const thread_ts = event.thread_ts || event.ts;

    // Set the app's loading state while waiting for the LLM response
    await client.assistant.threads.setStatus({
      channel_id: channel,
      thread_ts: thread_ts,
      status: 'thinking...',
      loading_messages: [
        'Teaching the hamsters to type faster…',
        'Untangling the internet cables…',
        'Consulting the office goldfish…',
        'Polishing up the response just for you…',
        'Convincing the AI to stop overthinking…',
      ],
    });

    // Send message history and newest question to LLM
    const llmResponse = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: `System: ${DEFAULT_SYSTEM_CONTENT}\n\nUser: ${text}`,
      stream: true,
    });

    // Stream the LLM response to the channel
    const streamer = client.chatStream({
      channel: channel,
      thread_ts: thread_ts,
      recipient_team_id: team,
      recipient_user_id: user,
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
});

/**
 * `feedback` action responds to the `feedbackBlock` that displays positive
 * and negative feedback icons. This block is attached to the bottom of
 * LLM responses using the `WebClient#chatStream.stop()` method.
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
   *
   * @see {@link https://docs.slack.dev/reference/events/assistant_thread_started}
   */
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
       *
       * @see {@link https://docs.slack.dev/reference/methods/assistant.threads.setSuggestedPrompts}
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

  /**
   * `assistant_thread_context_changed` is sent when a user switches channels
   * while the Assistant container is open. If `threadContextChanged` is not
   * provided, context will be saved using the AssistantContextStore's `save`
   * method (either the DefaultAssistantContextStore or custom, if provided).
   *
   * @see {@link https://docs.slack.dev/reference/events/assistant_thread_context_changed}
   */
  threadContextChanged: async ({ logger, saveThreadContext }) => {
    // const { channel_id, thread_ts, context: assistantContext } = event.assistant_thread;
    try {
      await saveThreadContext();
    } catch (e) {
      logger.error(e);
    }
  },

  /**
   * Messages sent from the user to the Assistant are handled in this listener.
   *
   * @see {@link https://docs.slack.dev/reference/events/message}
   */
  userMessage: async ({ client, context, logger, message, getThreadContext, say, setTitle, setStatus }) => {
    /**
     * Messages sent to the Assistant can have a specific message subtype.
     *
     * Here we check that the message has "text" and was sent to a thread to
     * skip unexpected message subtypes.
     *
     * @see {@link https://docs.slack.dev/reference/events/message#subtypes}
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
       *
       * @see {@link https://docs.slack.dev/reference/methods/assistant.threads.setTitle}
       */
      await setTitle(message.text);

      /**
       * Set the status of the Assistant to give the appearance of active processing.
       *
       * @see {@link https://docs.slack.dev/reference/methods/assistant.threads.setStatus}
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

      /** Scenario 1: Handle suggested prompt selection
       * The example below uses a prompt that relies on the context (channel) in which
       * the user has asked the question (in this case, to summarize that channel).
       */
      if (message.text === 'Assistant, please summarize the activity in this channel!') {
        const threadContext = await getThreadContext();
        let channelHistory;

        try {
          channelHistory = await client.conversations.history({
            channel: threadContext.channel_id,
            limit: 50,
          });
        } catch (e) {
          // If the Assistant is not in the channel it's being asked about,
          // have it join the channel and then retry the API call
          if (e.data.error === 'not_in_channel') {
            await client.conversations.join({ channel: threadContext.channel_id });
            channelHistory = await client.conversations.history({
              channel: threadContext.channel_id,
              limit: 50,
            });
          } else {
            logger.error(e);
          }
        }

        // Prepare and tag the prompt and messages for LLM processing
        let llmPrompt = `Please generate a brief summary of the following messages from Slack channel <#${threadContext.channel_id}>:`;
        for (const m of channelHistory.messages.reverse()) {
          if (m.user) llmPrompt += `\n<@${m.user}> says: ${m.text}`;
        }

        // Send channel history and prepared request to LLM
        const llmResponse = await openai.responses.create({
          model: 'gpt-4o-mini',
          input: `System: ${DEFAULT_SYSTEM_CONTENT}\n\nUser: ${llmPrompt}`,
          stream: true,
        });

        // Provide a response to the user
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
        await streamer.stop({ blocks: [feedbackBlock] });
        return;
      }

      /**
       * Scenario 2: Format and pass user messages directly to the LLM
       */

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
      await streamer.stop({ blocks: [feedbackBlock] });
    } catch (e) {
      logger.error(e);

      // Send message to advise user and clear processing status if a failure occurs
      await say({ text: `Sorry, something went wrong! ${e}` });
    }
  },
});

app.assistant(assistant);

/** Start the Bolt App */
(async () => {
  try {
    await app.start();
    app.logger.info('⚡️ Bolt app is running!');
  } catch (error) {
    app.logger.error('Failed to start the app', error);
  }
})();
```

</details>