# AI Assistant

In this tutorial, you will create an app, enable the features to take advantage of platform AI capabilities, and explore adding code to set suggested prompts, respond to assistant-related events, and integrate an LLM with which you can correspond.

## Prerequisites {#prereqs}

Before getting started, you will need the following:

* a development workspace where you have permissions to install apps. If you don’t have a workspace, go ahead and set that up now&mdash;you can [go here](https://slack.com/get-started#create) to create one, or you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.
* an [OpenAI](https://auth.openai.com/log-in) account with sufficient credits, and in which you can generate an API key.

**Skip to the code**

If you'd rather skip the tutorial and just head straight to the code, you can use our [Bolt for JavaScript App Agent & Assistant Template](https://github.com/slack-samples/bolt-js-assistant-template).

## Creating your app {#create-app}

1. Navigate to the [app creation page](https://api.slack.com/apps/new) and select **From a manifest**.
2. Select the workspace you want to install the application in.
3. Copy the contents of the [`manifest.json`](https://github.com/slack-samples/bolt-js-assistant-template/blob/main/manifest.json) file into the text box that says **Paste your manifest code here** (within the **JSON** tab) and click **Next**.
4. Review the configuration and click **Create**.
5. You're now in your app configuration's **Basic Information** page. Navigate to the **Install App** link in the left nav and click **Install to Workspace**, then **Allow** on the screen that follows.

### Obtaining your environment variables {#env-variables}

Before you'll be able to successfully run the app, you'll need to first obtain and set some environment variables.

1. **Bot token**: On the **Install App** page, copy your **Bot User OAuth Token**. You will store this in your environment as `SLACK_BOT_TOKEN` (we'll get to that next).
2. **App token**: Navigate to **Basic Information** and in the **App-Level Tokens** section, click **Generate Token and Scopes**. Add the [`connections:write`](/reference/scopes/connections.write) scope, name the token, and click **Generate**. (More on tokens [here](/authentication/tokens)). Copy this token. You will store this in your environment as `SLACK_APP_TOKEN`.
3. **OpenAI token**: Obtain a [secret key](https://platform.openai.com/settings/organization/api-keys) from OpenAI with the "all" permission selected. Keep this for `OPENAI_API_KEY`.

Save these for the moment; we first need to clone the project, then we'll set these variables.

### Clone the sample project {#clone}

In your terminal window, run the following command to clone the project repository locally:

```bash
# Clone this project onto your machine
git clone https://github.com/slack-samples/bolt-js-assistant-template.git
```

Then navigate to its directory:

```bash
# Change into this project directory
cd bolt-js-assistant-template
```

Open the project in a new Visual Studio Code window by running the following command:

```bash
code .
```

### Set your environment variables {#set-vars}

Now, we are ready to store those environment variables.

1. Rename the `.env.sample` file to `.env`
2. Open the file and replace `YOUR_SLACK_APP_TOKEN` with the value of the token you generated on the **Basic Information** page. Replace `YOUR_SLACK_BOT_TOKEN` with the value of the token generated when you installed the app. Replace `OPENAI_API_KEY` with the key you generated with OpenAI.

```bash title=".env"
SLACK_APP_TOKEN=xapp-1-example-token
SLACK_BOT_TOKEN=xoxb-example-token
OPENAI_API_KEY=openai_exampletoken
```

### Run the app {#run}

We are almost ready to run the app. First, navigate to your terminal window and run the following command to install all necessary packages:

```bash
npm install
```

Then:

```bash
npm run
```

If your app is up and running, you'll see a message that says `⚡️ Bolt app is running!`.

## Exploring app functionality {#assistant-functionality}

Creating this app from the manifest of a sample app added several features you can explore in the [app settings](https://api.slack.com/apps). These include setting several scopes (found on the **OAuth & Permissions** page), enabling the chat tab (found on the **App Home** page), enabling the feature for AI capabilities (found on the **Agents & AI Apps** page), and listening for a few events (found under **Subscribe to bot events** on the **Event Subscriptions** page). We'll see how these all come together to support the app's AI functionality in the app logic. Navigate back to Visual Studio Code and open the `app.js` file.

## App code {#app-code}

### Import relevant modules {#import-modules}

This app's code is split into a few different files. The main ones we'll look at here are the `app.js` file, the `ai/index.js` file, and the `listeners/assistant/index.js` file. 

The app is initialized in the `app.js` file, and we import a few relevant modules to be able to use the Bolt classes. 

```js
import 'dotenv/config';
import { App, LogLevel } from '@slack/bolt';
import { registerListeners } from './listeners/index.js';
```

After the import statements, we initialize the app using the environment variables we previously saved in the `.env` file, then register the listeners. Listeners are a utility for responding to app events.

```js
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

// Register the action and event listeners
registerListeners(app);

// Start the Bolt app
(async () => {
  try {
    await app.start();
    app.logger.info('⚡️ Bolt app is running!');
  } catch (error) {
    app.logger.error('Failed to start the app', error);
  }
})();
```

The AI part of initialization happens in the `index.js` file in the `ai` directory. In this file, we import another important module that allows the app to communicate with OpenAI.

```js
import { OpenAI } from 'openai';
```

After this, we see some text saved to the `DEFAULT_SYSTEM_CONTENT` variable. This is used later when constructing the message to send to OpenAI; we'll get to why this is necessary later.

```js
// LLM system prompt
export const DEFAULT_SYSTEM_CONTENT = `You're an assistant in a Slack workspace.
Users in the workspace will ask you to help them write something or to think better about a specific topic.
You'll respond to those questions in a professional way.
When you include markdown text, convert them to Slack compatible ones.
When a prompt has Slack's special syntax like <@USER_ID> or <#CHANNEL_ID>, you must keep them as-is in your response.`;
```

Next, we initialize the `openai` client with the `OPENAI_API_KEY` token we previously saved as an environment variable in the `.env` file.

```js

// OpenAI LLM client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

In the `listeners/assistant/index.js` file, we initialize the Bolt Assistant class. The Assistant class is a [Bolt feature](/tools/bolt-js/concepts/ai-apps) that simplifies handling incoming events related to the app assistant.

```js
import { Assistant } from '@slack/bolt';
import { assistantThreadContextChanged } from './assistant_thread_context_changed.js';
import { assistantThreadStarted } from './assistant_thread_started.js';
import { message } from './message.js';

/**
 * @param {import("@slack/bolt").App} app
 */
export const register = (app) => {
  const assistant = new Assistant({
    threadStarted: assistantThreadStarted,
    threadContextChanged: assistantThreadContextChanged,
    userMessage: message,
  });

  app.assistant(assistant);
};
```

### ThreadContextStore {#thread-context-store}

In this sample app, we've opted to rely on the thread context information provided by the `assistant_thread_started` and `assistant_thread_context_changed` events; however, it's important to know that the `message.im` event does not provide this information. You may therefore opt to use a custom `ThreadContextStore`.

### Responding to `assistant_thread_started` event

The [`assistant_thread_started`](/reference/events/assistant_thread_started) event is sent when a user opens the assistant container, either with a DM or from the top nav bar entry point. Responding to this event starts the conversation with the user. Here (in the [`assistant_thread_started.js`](https://github.com/slack-samples/bolt-js-assistant-template/blob/main/listeners/assistant/assistant_thread_started.js) listener file) we greet the user then set some suggested prompts. The `message` field of each prompt is what is sent to the assistant when the user clicks on the prompt.

```js
export const assistantThreadStarted = async ({ event, logger, say, setSuggestedPrompts, saveThreadContext }) => {
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
};
```

In this sample app, we only set suggested prompts at the initial interaction with the user, but you can set these dynamically at any time during your interaction. Alternatively, if you'd like to set fixed, hardcoded prompts, you can do so in the [app settings](https://api.slack.com/apps) under **Agents & AI Apps**.

### Reacting to `assistant_thread_context_changed` event

The [`assistant_thread_context_changed`](/reference/events/assistant_thread_context_changed) event is sent when the user switches channels while the assistant container is open. Listening to this event, and subsequently saving the new context, is important because it gives you timely information about what your user is looking at, and therefore, asking about. This updated context allows you to respond more appropriately. See how we do that in the [`assistant_thread_context_changed.js`](https://github.com/slack-samples/bolt-js-assistant-template/blob/main/listeners/assistant/assistant_thread_context_changed.js) listener:

```js
/**
 * The `assistant_thread_context_changed` event is sent when a user switches
 * channels while the Assistant container is open. If `threadContextChanged` is
 * not provided, context will be saved using the AssistantContextStore's `save`
 * method (either the DefaultAssistantContextStore or custom, if provided).
 *
 * @param {Object} params
 * @param {import("@slack/bolt").Logger} params.logger - Logger instance.
 * @param {Function} params.saveThreadContext - Function to save thread context.
 *
 * @see {@link https://docs.slack.dev/reference/events/assistant_thread_context_changed}
 */
export const assistantThreadContextChanged = async ({ logger, saveThreadContext }) => {
  // const { channel_id, thread_ts, context: assistantContext } = event.assistant_thread;
  try {
    await saveThreadContext();
  } catch (e) {
    logger.error(e);
  }
};
```

### Processing a user message for LLM {#user-message}

When a user sends a message to the app, there are a couple of things we do before processing that message: set the title and set the status. Sample code here is taken from the [`message.js`](https://github.com/slack-samples/bolt-js-assistant-template/blob/c39c4e3c3d9162e1dcff406e2b05f184947231c3/listeners/assistant/message.js) listener:

```js
...
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
...
```

The `setTitle` method calls the [`assistant.threads.setTitle`](/reference/methods/assistant.threads.setTitle) method. Setting this title helps organize the conversations to the app, as they appear in a referential list in the history tab of the app.

The `setStatus` method calls the [`assistant.threads.setStatus`](/reference/methods/assistant.threads.setStatus) method. This status shows like a typing indicator underneath the message composer. This status automatically clears when the app sends a reply. You can also clear it by sending an empty string, like this:

```js
await setStatus('');
```

We show a couple of examples in this sample app of how to handle user message processing: use channel history to give context to the user's message, and use thread history to give context to the user's message. Here is how to do each and prepare the information for sending to OpenAI.

#### Using channel history for context {#channel-history}

For this scenario, the user is in a channel and the app has access to that channel context. For demonstrative purposes, we use the string that we previously set as a suggested prompt for the `if` statement, but you could parse the user message for certain keywords to get the same result.

```js
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
```

After getting the channel history, it's time to construct the prompt to send to OpenAI. OpenAI prompts contain an array of `messages` in which each message object has a `role` and `content`.

The `role` represents the perspective from which you'd like model to respond to the provided input and influences how the model might interpret the input. The three possible role values are `system`, `assistant`, and `user`.

* The `system` role provides high-level instructions; it sets the scene.
* The `assistant` role denotes the model's response. We'll see this further down in the code when we provided a thread history to the model for context.
* The `user` role is the user talking to the assistant or other users.

Refer back to the top of the `ai/index.js` file to where we defined the `DEFAULT_SYSTEM_CONTENT` variable, and notice how that message now makes sense to provide the model alongside the `system` role for setting the scene of the model's response.

```js

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
```

In this scenario, we've provided the channel history within the user message. Let's take a look at how you might provide contextual information as separate objects in the `messages` array.

#### Using thread history for context {#thread-history}

In the code that follows, we provide the thread history to the LLM for interpreting, rather than the channel history. This is for simplification in the sample, but you could combine the two concepts in your own app.

```js
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
```

After getting the thread replies, we map them to the appropriate object structure to send to OpenAI, providing the `role` and `content` from each conversation reply. Notice how we check for the presence of a `bot_id` to determine which `role` to set. This constructs the message history for the LLM to interpret and use as context when providing a response.

```js

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
```

The entirety of the user message processing in this example is wrapped in a try-catch block to provide the user an error message when something goes wrong, which is a best practice. If successful, the final action we take is to call the `say` method with the LLM response. This sample also shows how to implement [text streaming](/ai/developing-ai-apps#streaming) in code. Omitting the `streamer` would result in the app responding with one block of text, versus providing chunks at a time.

#### Using the markdown block in `say` {#markdown-block}

To safeguard against any markdown translation errors, we can return our text response inside of a [markdown block](/reference/block-kit/blocks/markdown-block) in the `say` section of code, instead of relying on providing precise enough instructions to the LLM. Here's how that would look:

```js
...
      await say(
        {
          blocks: [
          {
            "type": "markdown",
            "text": llmResponse.choices[0].message.content,
          }
        ]
      }
    )
...
```

This ensures that if the LLM's response included, for example, a code block, it would be formatted appropriately when sent to the user as a response.

## Next steps {#next-steps}

### Consider HTTP {#http}

This sample app uses Socket Mode to receive events. This is great for developing and testing out your app, but we recommend using HTTP to receive events for a production-ready app. Read more about the differences between Socket Mode and HTTP [here](/apis/events-api/comparing-http-socket-mode).

### Learn more {#learn}

➡️ Read more about Bolt support for apps using platform AI features in the documentation [here](/tools/bolt-js/concepts/ai-apps).

➡️ Level up your AI game after reading through the [usage guide](/ai/developing-ai-apps) and [Best practices for AI feature-enabled apps](/ai/ai-apps-best-practices).

### Explore pre-built apps using AI features {#marketplace}

Check out pre-built apps ready for use in the [Slack Marketplace](https://community.slack.com/marketplace/category/At07HZAKCSAC-agents-assistants).
