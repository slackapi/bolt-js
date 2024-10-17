---
title: Agents & Assistants
lang: en
slug: /concepts/assistant
---

This guide focuses on how to implement Agents & Assistants using Bolt. For general information about the feature, please refer to the [API documentation](https://api.slack.com/docs/apps/ai).

To get started, enable the **Agents & Assistants** feature on [the app configuration page](https://api.slack.com/apps). Add [`assistant:write`](https://api.slack.com/scopes/assistant:write), [`chat:write`](https://api.slack.com/scopes/chat:write), and [`im:history`](https://api.slack.com/scopes/im:history) to the **bot** scopes on the **OAuth & Permissions** page. Make sure to subscribe to the [`assistant_thread_started`](https://api.slack.com/events/assistant_thread_started), [`assistant_thread_context_changed`](https://api.slack.com/events/assistant_thread_context_changed), and [`message.im`](https://api.slack.com/events/message.im) events on the **Event Subscriptions** page.

Please note that this feature requires a paid plan. If you don't have a paid workspace for development, you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.

To handle assistant thread interactions with humans, although you can implement your agents [using `app.event(...)` listeners](event-listening) for `assistant_thread_started`, `assistant_thread_context_changed`, and `message` events, Bolt offers a simpler approach by way of an `Assistant` class.

```js
const assistant = new Assistant({
  threadStarted: async ({ event, say, setSuggestedPrompts, saveThreadContext }) => {
    const { context } = event.assistant_thread;

    await say({
      text: 'Hi, how can I help?',
      metadata: { event_type: 'assistant_thread_context', event_payload: context },
    });

    await saveThreadContext();

    const prompts = [{
      title: 'Fun Slack fact',
      message: 'Give me a fun fact about Slack, please!',
    }];

    // Provide the user up to 4 optional, preset prompts to choose from.
    await setSuggestedPrompts({ prompts });
  },
  threadContextChanged: async ({ saveThreadContext }) => {
    await saveThreadContext();
  },
  userMessage: async ({ client, message, say, setTitle, setStatus }) => {
    const { channel, thread_ts } = message;

    // Set the title of the Assistant thread to capture the initial topic/question
    await setTitle(message.text);

    // Set the status of the Assistant to give the appearance of active processing.
    await setStatus('is typing..');

    // Retrieve the Assistant thread history for context of question being asked
    const thread = await client.conversations.replies({
      channel,
      ts: thread_ts,
      oldest: thread_ts,
    });

    // Prepare and tag each message for LLM processing
    const userMessage = { role: 'user', content: message.text };
    const threadHistory = thread.messages.map((m) => {
      const role = m.bot_id ? 'assistant' : 'user';
      return { role, content: m.text };
    });

    const messages = [
      { role: 'system', content: DEFAULT_SYSTEM_CONTENT },
      ...threadHistory,
      userMessage,
    ];

    // Send message history and newest question to LLM
    const llmResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      n: 1,
      messages,
    });

    // Provide a response to the user
    await say(llmResponse.choices[0].message.content);
  },
});

app.assistant(assistant);
```

When a user opens an Assistant thread while in a channel, the channel information is stored as the thread's `AssistantThreadContext` data. You can access this information by using the `getThreadContext()` utility. The reason Bolt provides this utility is that the most recent thread context information is not included in the subsequent user message event payload data. Therefore, an app must store the context data when it is changed so that the app can refer to the data in message event listeners.

When the user switches channels, the `assistant_thread_context_changed` event will be sent to your app. If you use the built-in `AssistantThreadContextStore` without any custom configuration (like the above code snippet does), the updated context data is automatically saved as message metadata on the first reply from the assistant bot.

As long as you use the built-in approach, you don't need to store the context data within a datastore. The downside of this default behavior is the overhead of additional calls to the Slack API. These calls include those to `conversations.history` which are used to look up the stored message metadata that contains the thread context (via `getThreadContext()`).

To store context elsewhere, pass a custom `AssistantThreadContextStore` implementation to the `Assistant` constructor through the `threadContextStore` property. If not provided, Bolt utilizes a `DefaultThreadContextStore`, which is a reference implementation that relies on storing and retrieving message metadata as the context changes. A custom `threadContextStore` must feature `get` and `save` methods.

```js
const assistant = new Assistant({
  threadContextStore: {
    get: async ({ context, client, payload }) => {},
    save: async ({ context, client, payload }) => {},
  },
  threadStarted: async () => {},
  threadContextChanged: async () => {},
  userMessage: async () => {},
});
```

For a fully functional example, please refer to the [Bolt for JavaScript Assistant template](https://github.com/slack-samples/bolt-js-assistant-template) on GitHub.