---
title: Agents & Assistants
lang: en
slug: /concepts/assistant
---

:::info[This feature requires a paid plan]
If you don't have a paid workspace for development, you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.
:::

Agents and assistants comprise a new messaging experience for Slack. If you're unfamiliar with using agents and assistants within Slack, you'll want to read the [API documentation on the subject](https://api.slack.com/docs/apps/ai). Then come back here to implement them with Bolt!

## Configuring your app to support assistants 

1. Within [App Settings](https://api.slack.com/apps), enable the **Agents & Assistants** feature.

2. Within the App Settings **OAuth & Permissions** page, add the following scopes: 
  * [`assistant:write`](https://api.slack.com/scopes/assistant:write)
  * [`chat:write`](https://api.slack.com/scopes/chat:write)
  * [`im:history`](https://api.slack.com/scopes/im:history)

3. Within the App Settings **Event Subscriptions** page, subscribe to the following events: 
  * [`assistant_thread_started`](https://api.slack.com/events/assistant_thread_started)
  * [`assistant_thread_context_changed`](https://api.slack.com/events/assistant_thread_context_changed)
  * [`message.im`](https://api.slack.com/events/message.im)

:::info
You _could_ implement your own assistants by [listening](/concepts/event-listening) for the `assistant_thread_started`, `assistant_thread_context_changed`, and `message.im` events. That being said, using the `Assistant` class will streamline the process. And we already wrote this nice guide for you!
:::

## The `Assistant` class instance

The [`Assistant`](/reference#the-assistantconfig-configuration-object) can be used to handle the incoming events expected from a user interacting with an assistant in Slack. A typical flow would look like:

1. [The user starts a thread](#handling-new-thread). The `Assistant` class handles the incoming [`assistant_thread_started`](https://api.slack.com/events/assistant_thread_started) event.
2. [The thread context may change at any point](#handling-thread-context-changes). The `Assistant` class can handle any incoming [`assistant_thread_context_changed`](https://api.slack.com/events/assistant_thread_context_changed) events. The class also provides a default `context` store to keep track of thread context changes as the user moves through Slack.
3. [The user responds](#handling-user-response). The `Assistant` class handles the incoming [`message.im`](https://api.slack.com/events/message.im) event. 

```ts
const assistant = new Assistant({
  // If you prefer to not use the provided DefaultThreadContextStore, 
  // you can use your own optional threadContextStore 
  threadContextStore: {
    get: async ({ context, client, payload }) => {},
    save: async ({ context, client, payload }) => {},
  },
  threadStarted: async ({ say, saveThreadContext, setStatus, setSuggestedPrompts, setTitle }) => {},
  // threadContextChanged is optional
  // If you use your own optional threadContextStore you likely won't use it
  threadContextChanged: async ({ say, setStatus, setSuggestedPrompts, setTitle }) => {},
  userMessage: async ({ say, getThreadContext, setStatus, setSuggestedPrompts, setTitle }) => {},
});
```

While the `assistant_thread_started` and `assistant_thread_context_changed` events do provide Slack-client thread context information, the `message.im` event does not. Any subsequent user message events won't contain thread context data. For that reason, Bolt not only provides a way to store thread context — the `threadContextStore` property — but it also provides a `DefaultThreadContextStore` instance that is utilized by default. This implementation relies on storing and retrieving [message metadata](https://api.slack.com/metadata/using) as the user interacts with the assistant. 

If you do provide your own `threadContextStore` property, it must feature `get` and `save` methods.

:::tip
Be sure to give the [assistants reference docs](/reference#assistants) a look!
:::

## Handling a new thread {#handling-new-thread}

When the user opens a new thread with your assistant, the [`assistant_thread_started`](https://api.slack.com/events/assistant_thread_started) event will be sent to your app. Capture this with the `threadStarted` handler to allow your app to respond. 

In the example below, the app is sending a message — containing thread context [message metadata](https://api.slack.com/metadata/using) — to the user, along with a single [prompt](https://api.slack.com/methods/assistant.threads.setSuggestedPrompts).

```js
...
  threadStarted: async ({ event, say, setSuggestedPrompts, saveThreadContext }) => {
    const { context } = event.assistant_thread;

    await say({
      text: 'Hi, how can I help?',
      metadata: { event_type: 'assistant_thread_context', event_payload: context },
    });

    const prompts = [{
      title: 'Fun Slack fact',
      message: 'Give me a fun fact about Slack, please!',
    }];

    // Provide the user up to 4 optional, preset prompts to choose from.
    await setSuggestedPrompts({ prompts });
  },
...
```

:::tip
When a user opens an assistant thread while in a channel, the channel info is stored as the thread's `AssistantThreadContext` data. You can grab that info using the `getThreadContext()` utility, as subsequent user message event payloads won't include the channel info. 
:::

## Handling thread context changes {#handling-thread-context-changes}

When the user switches channels, the [`assistant_thread_context_changed`](https://api.slack.com/events/assistant_thread_context_changed) event will be sent to your app. Capture this with the `threadContextChanged` handler.

```js
...
  threadContextChanged: async ({ saveThreadContext }) => {
    await saveThreadContext();
  },
...
```

If you use the built-in `AssistantThreadContextStore` without any custom configuration the updated thread context data is automatically saved as [message metadata](https://api.slack.com/metadata/using) on the first reply from the assistant bot.

## Handling the user response {#handling-user-response}

When the user messages your assistant, the [`message.im`](https://api.slack.com/events/message.im) event will be sent to your app. Capture this with the `userMessage` handler. 

The `setTitle` and `setStatus` [utilities](/reference#the-assistantconfig-configuration-object) are useful in curating the user experience. 

:::warning
Messages sent to the assistant do not contain a subtype and must be deduced based on their shape and any provided [message metadata](https://api.slack.com/metadata/using).
:::

 ```js
 ...
  userMessage: async ({ client, message, say, setTitle, setStatus }) => {
    const { channel, thread_ts } = message;

    try {
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
      
    } catch (e) {
      console.error(e);

      // Send message to advise user and clear processing status if a failure occurs
      await say({ text: 'Sorry, something went wrong!' });
    }
  },
});

app.assistant(assistant);
```

## Full example

<details>
<summary>App Agent & Assistant Template</summary>

Below is the `app.js` file of the [App Agent & Assistant Template repo](https://github.com/slack-samples/bolt-js-assistant-template/) we've created for you to build off of. 

```js reference title="app.js"
https://github.com/slack-samples/bolt-js-assistant-template/blob/main/app.js
```
</details>