---
title: Agents & Assistants
lang: en
slug: /concepts/assistant
---

:::info[This feature requires a paid plan]
If you don't have a paid workspace for development, you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.
:::

Agents and assistants comprise a new messaging experience for Slack. If you're unfamiliar with using agents and assistants within Slack, you'll want to read the [API documentation on the subject](https://api.slack.com/docs/apps/ai). Then, come back here to implement them with Bolt!

## Configuring your app to support assistants 

1. Within [App Settings](https://api.slack.com/apps), enable the **Agents & Assistants** feature.

2. Within the App Settings **OAuth & Permissions** page, add the following scopes: 
  * [`assistant:write`](https://api.slack.com/scopes/assistant:write)
  * [`chat:write`](https://api.slack.com/scopes/chat:write)
  * [`im:history`](https://api.slack.com/scopes/im:history)

3 Within the App Settings **Event Subscriptions** page, subscribe to the following events: 
  * [`assistant_thread_started`](https://api.slack.com/events/assistant_thread_started)
  * [`assistant_thread_context_changed`](https://api.slack.com/events/assistant_thread_context_changed)
  * [`message.im`](https://api.slack.com/events/message.im)

:::info
You _could_ implement your own assistants by [listening](/concepts/event-listening) for the `assistant_thread_started`, `assistant_thread_context_changed`, and `message.im` events. That being said, using the `Assistant` class will streamline the process. And we already wrote this nice guide for you!
:::

## The `Assistant` class

### Instance structure

```ts
const assistant = new Assistant({
  threadContextStore: {
    get: async ({ context, client, payload }) => {},
    save: async ({ context, client, payload }) => {},
  },
  threadStarted: async ({ say, saveThreadContext, setStatus, setSuggestedPrompts, setTitle }) => {},
  threadContextChanged: async ({ say, setStatus, setSuggestedPrompts, setTitle }) => {},
  userMessage: async ({ say, getThreadContext, setStatus, setSuggestedPrompts, setTitle }) => {},
});
```

### The `AssistantConfig` configuration object

| Property | Required? | Description | 
|---|---|---|
|`threadContextStore` | Optional, but recommended | When provided, must have the required methods to get and save thread context, which will override the `getThreadContext` and `saveThreadContext` utilities. <br/> <br/> If not provided, a `DefaultAssistantContextStore` instance is used.
| `threadStarted` | Required | Executes when the user opens the assistant container or otherwise begins a new chat, thus sending the [`assistant_thread_started`](https://api.slack.com/events/assistant_thread_started) event.
| `threadContextChanged` | Optional | Executes when a user switches channels while the assistant container is open, thus sending the [`assistant_thread_context_changed`](https://api.slack.com/events/assistant_thread_context_changed) event. <br/> <br/>  If not provided, context will be saved using the AssistantContextStore's `save` method (either the `DefaultAssistantContextStore` instance or provided `threadContextStore`).
| `userMessage` | Required |  Executes when a [message](https://api.slack.com/events/message), thus sending the [`message.im`](https://api.slack.com/events/message.im) event. These messages do not contain a subtype and must be deduced based on their shape and metadata (if provided). Bolt handles this deduction out of the box for those using the `Assistant` class.

### Utilities 

Utility | Description
|---|---|
| `getThreadContext` | Alias for `AssistantContextStore.get()` method. Executed if custom `AssistantContextStore` value is provided.  <br/><br/>  If not provided, the `DefaultAssistantContextStore` instance will retrieve the most recent context saved to the instance.
| `saveThreadContext` | Alias for `AssistantContextStore.save()`. Executed if `AssistantContextStore` value is provided. <br/> <br/> If not provided, the `DefaultAssistantContextStore` instance will save  the `assistant_thread.context` to the instance and attach it to the initial assistant message that was sent to the thread.
| `say(message: string)` | Alias for the `postMessage` method.<br/><br/> Sends a message to the current assistant thread.
| `setTitle(title: string)` | [Sets the title](https://api.slack.com/methods/assistant.threads.setTitle) of the assistant thread to capture the initial topic/question.
| `setStatus(status: string)` | Sets the [status](https://api.slack.com/methods/assistant.threads.setStatus) of the assistant to give the appearance of active processing.
| `setSuggestedPrompts({ prompts: [{ title: string; message: string; }]` |  Provides the user up to 4 optional, preset [prompts](https://api.slack.com/methods/assistant.threads.setSuggestedPrompts) to choose from.

## Handling a new thread

The `threadStarted` event handler allows your app to respond to new threads opened by users. In the example below, the app is sending a message — containing context message metadata — to the user, along with a single [prompt](https://api.slack.com/methods/assistant.threads.setSuggestedPrompts).

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
...
```

:::tip
When a user opens an assistant thread while in a channel, the channel info is stored as the thread's `AssistantThreadContext` data. You can grab that info using the `getThreadContext()` utility, as subsequent user message event payloads won't include the channel info. 
:::


## Handling context changes 

You can store context through the `threadContextStore` property but it must feature `get` and `save` methods.

```js
threadContextStore: {
  get: async ({ context, client, payload }) => {},
  save: async ({ context, client, payload }) => {},
  },
```

If not provided, a `DefaultThreadContextStore` instance is utilized instead, which is a reference implementation that relies on storing and retrieving message metadata as the context changes. 

When the user switches channels, the `assistant_thread_context_changed` event will be sent to your app. Capture this with the `threadContextChanged` handler.

```js
...
    threadContextChanged: async ({ saveThreadContext }) => {
    await saveThreadContext();
  },
...
```

If you use the built-in `AssistantThreadContextStore` without any custom configuration the updated context data is automatically saved as message metadata on the first reply from the assistant bot.

## Handling the user response

User messages are handled with the `userMessage` event handler. The `setTitle` and `setStatus` utilities are useful in curating the user experience. 

:::warning
Messages sent to the assistant do not contain a subtype and must be deduced based on their shape and any provided metadata.
:::

 ```js
 ...
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

## Full example

<details>
<summary>App Agent & Assistant Template</summary>

Below is the `app.js` file of the [App Agent & Assistant Template repo](https://github.com/slack-samples/bolt-js-assistant-template/) we've created for you to build off of. 

```js reference title="app.js"
https://github.com/slack-samples/bolt-js-assistant-template/blob/main/app.js
```
</details>