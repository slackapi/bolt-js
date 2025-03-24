---
title: AI Code Assistant with Hugging Face
slug: /tutorials/code-assistant
lang: en
---

In this tutorial, we will create an [AI app](https://docs.slack.dev/ai/developing-ai-apps) with the Bolt framework and integrate a [Hugging Face](https://huggingface.co) model to assist the user with coding questions. We'll also make this functionality available as a step in a workflow to use in Workflow Builder.

Hugging Face is an open-source community best known for its transformers library and platform for machine learning models. Hugging Face's model hub is an online repository where you can find thousands of pre-trained models for natural language processing, computer vision, speech recognition, and more. The platform is open-source, so anyone can contribute to the models and browse the models others have started. Here, we will be using the [Qwen2.5-Coder-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct) model to create an app that can answer coding questions.

## Prerequisites {#prereqs}

Before getting started, you will need the following:
* a development workspace where you have permissions to install apps. If you don’t have a workspace, go ahead and set that up now&mdash;you can [go here](https://slack.com/get-started#create) to create one, or you can join the [Developer Program](https://api.slack.com/developer-program) and provision a sandbox with access to all Slack features for free.
* a Hugging Face account in which you have generated an access token.

## Creating your app {#create-app}

1. Navigate to the [app creation page](https://api.slack.com/apps/new) and select **From a manifest**.
2. Select the workspace you want to install the application in and click **Next**.
3. Copy the contents below and paste it into the text box that says **Paste your manifest code here** (within the **JSON** tab), replacing the placeholder text, and click **Next**.

```json
{
  "display_information": {
    "name": "Code Assistant"
  },
  "features": {
    "app_home": {
      "home_tab_enabled": false,
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    },
    "bot_user": {
      "display_name": "Code Assistant",
      "always_online": false
    },
    "assistant_view": {
      "assistant_description": "An Assistant to help you with coding questions and challenges!",
      "suggested_prompts": []
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "assistant:write",
        "channels:join",
        "im:history",
        "channels:history",
        "groups:history",
        "chat:write"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "bot_events": [
        "assistant_thread_context_changed",
        "assistant_thread_started",
        "message.im",
        "function_executed"
      ]
    },
    "interactivity": {
      "is_enabled": true
    },
    "org_deploy_enabled": true,
    "socket_mode_enabled": true,
    "function_runtime": "remote",
    "token_rotation_enabled": false
  },
  "functions": {
    "code_assist": {
      "title": "Code Assist",
      "description": "Get an answer about a code related question",
      "input_parameters": {
        "message_id": {
          "type": "string",
          "title": "Message ID",
          "description": "The message the question was asked in.",
          "is_required": true
        },
        "channel_id": {
          "type": "slack#/types/channel_id",
          "title": "Channel ID",
          "description": "The channel the question was asked in",
          "is_required": true
        }
      },
      "output_parameters": {
        "message": {
          "type": "string",
          "title": "Answer",
          "description": "The response from the Code Assistant LLM",
          "is_required": true
        }
      }
    }
  }
}
```

4. Review the configuration and click **Create**. Clicking around in these settings, you can see what the manifest has created for us. Some highlights:
* Within **App Home**, we've enabled the **Chat Tab**. This will allow users to access your app both in the split-view container as well as within a chat tab of the app.
* **Agents & AI Apps** is enabled. With this toggled on, the split-view container is available for your app.
* A custom step has been added to **Workflow Steps**. A workflow step is a custom step that can be used in Workflow Builder. Setting up information about that step here (its name, input parameters, and output parameters) lets Slack know what data to collect from the workflow to send to the function. We'll implement the logic step for this in code.
* **Org Level Apps** has been enabled. This means that your app will be installed at the organization level. Upon installation, it is not added to any workspaces, but the workspace admin can choose which workspaces in the org to add the app to.
* Within **OAuth & Permissions**, you will find several bot tokens have been added.
*  Within **Event Subscriptions**, you will find several events this app subscribes to, which allow it to respond to user requests appropriately.
5. Navigate to the **Install App** page in the left nav and click **Install to Workspace**, then **Allow** on the screen that follows.

### Obtaining your environment variables {#env-variables}

In order to connect this configuration with the app we are about to code, you'll need to first obtain and set some environment variables.
1. On the **Install App** page, copy your **Bot User OAuth Token**. You will store this in your environment as `SLACK_BOT_TOKEN` (we'll get to that next).
2. Navigate to **Basic Information** and in the **App-Level Tokens** section, click **Generate Token and Scopes**. Add the [`connections:write`](https://docs.slack.dev/reference/scopes/connections.write) scope, name the token, and click **Generate**. (More on tokens [here](https://docs.slack.dev/authentication/tokens)). Copy this token. You will store this in your environment as `SLACK_APP_TOKEN`.

Save these for the moment; we first need to set up our project locally, then we'll set these variables.

### Clone the starter template {#clone}

Create a new directory for your app:

```bash
mkdir code-assistant
cd code-assistant
```

In your terminal window, run the following command to clone the starter template repository locally: 

```bash
# Clone this project onto your machine
git clone https://github.com/slack-samples/bolt-js-starter-template.git
```

Then navigate to its directory:

```bash
# Change into this project directory
cd bolt-js-assistant-template
```

For this project, we will need to install [Axios](https://www.npmjs.com/package/axios), [Hugging Face Inference](https://www.npmjs.com/package/@huggingface/inference), and [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch). Run this command in your terminal window to install the dependencies we need:

```bash
npm install axios @huggingface/inference isomorphic-fetch
```

Open the project in a new Visual Studio Code window by running the following command:

```bash
code .
```

You'll see the dependencies we've installed reflected in the `package.json` file. 

This template also comes with a `manifest.json`, which may be confusing because we've already created our app in the [app settings](https://api.slack.com/apps) with a different manifest. This local manifest can safely be ignored. Everything we set in the app settings is the source of truth.

### Set your environment variables {#set-vars}

Now, we are ready to store those environment variables.
1. Rename the `.env.sample` file to `.env`
2. Open the file and replace `YOUR_SLACK_APP_TOKEN` with the value of the token you generated on the **Basic Information** page. Replace `YOUR_SLACK_BOT_TOKEN` with the value of the token generated when you installed the app. On a new line, add `HUGGINGFACE_API_KEY=` and the value of the access token you've generated in your account. Save your changes.

### Add app code {#app-code}

Delete the template contents in the `app.js` file and replace it with this:

```js
require("isomorphic-fetch");
const { App, LogLevel, Assistant } = require("@slack/bolt");
const { config } = require("dotenv");
const { HfInference } = require("@huggingface/inference");

config();

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
});

// HuggingFace configuration
const hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Model instructions
const DEFAULT_SYSTEM_CONTENT = `You're an AI assistant specialized in answering questions about code.
You'll analyze code-related questions and provide clear, accurate responses.
When you include markdown text, convert them to Slack compatible ones.
When you include code examles, convert them to Slack compatible ones. (There must be an empty line before a code block.)
When a prompt has Slack's special syntax like <@USER_ID> or <#CHANNEL_ID>, you must keep them as-is in your response.`;

function convertMarkdownToSlack(markdown) {
  let text = markdown;

  // Add newlines around code blocks first
  text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
    code = code.trim();
    return "\n\n```\n" + code + "\n```\n\n";
  });

  // Fix up any triple+ newlines to be double newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  // Remaining markdown conversions
  text = text.replace(/`([^`]+)`/g, "`$1`");
  text = text.replace(/\*\*([^*]+)\*\*/g, "*$1*");
  text = text.replace(/__([^_]+)__/g, "*$1*");
  text = text.replace(/\*([^*]+)\*/g, "_$1_");
  text = text.replace(/_([^_]+)_/g, "_$1_");
  text = text.replace(/~~([^~]+)~~/g, "~$1~");
  text = text.replace(/^>\s(.+)/gm, ">>>\n$1");
  text = text.replace(/^#{1,6}\s(.+)$/gm, "*$1*");
  text = text.replace(/^[\*\-\+]\s(.+)/gm, "• $1");
  text = text.replace(/^\d+\.\s(.+)/gm, "$1");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<$2|$1>");

  return text;
}

// Create the assistant
const assistant = new Assistant({
  threadStarted: async ({ say, setSuggestedPrompts }) => {
    try {
      await say(
        "Hi! I'm your coding assistant. Ask me any questions about code!",
      );

      const prompts = [
        {
          title: "Code Example",
          message:
            "Show me an example of implementing a binary search tree in JavaScript.",
        },
        {
          title: "Code Review",
          message:
            "What are best practices for writing clean, maintainable code?",
        },
        {
          title: "Debug Help",
          message: "How do I debug memory leaks in Node.js applications?",
        },
      ];

      await setSuggestedPrompts({
        prompts,
        title: "Here are some questions you can ask:",
      });
    } catch (error) {
      console.error("Error in threadStarted:", error);
    }
  },

  userMessage: async ({ message, client, say, setTitle, setStatus }) => {
    const { channel, thread_ts } = message;

    try {
      await setTitle(message.text);
      await setStatus("is thinking...");

      // Retrieve the Assistant thread history for context of question being asked
      const thread = await client.conversations.replies({
        channel,
        ts: thread_ts,
        oldest: thread_ts,
      });

      // Prepare and tag each message for LLM processing
      const userMessage = { role: "user", content: message.text };
      const threadHistory = thread.messages.map((m) => {
        const role = m.bot_id ? "assistant" : "user";
        return { role, content: m.text };
      });

      const messages = [
        { role: "system", content: DEFAULT_SYSTEM_CONTENT },
        ...threadHistory,
        userMessage,
      ];

      const modelResponse = await hfClient.chatCompletion({
        model: "Qwen/Qwen2.5-Coder-32B-Instruct",
        messages,
        max_tokens: 2000,
      });

      await setStatus("is typing...");
      await say(
        convertMarkdownToSlack(modelResponse.choices[0].message.content),
      );
    } catch (error) {
      console.error("Error in userMessage:", error);
      await say(
        "I'm sorry, I ran into an error processing your request. Please try again.",
      );
    }
  },
});

// Register the assistant with the app
app.assistant(assistant);

// Set up custom function for assistant
app.function("code_assist", async ({ client, inputs, complete, fail }) => {
  try {
    const { channel_id, message_id } = inputs;
    let messages;

    try {
      const result = await client.conversations.history({
        channel: channel_id,
        oldest: message_id,
        limit: 1,
        inclusive: true,
      });

      messages = [
        { role: "system", content: DEFAULT_SYSTEM_CONTENT },
        { role: "user", content: result.messages[0].text },
      ];
    } catch (e) {
      // If the Assistant is not in the channel it's being asked about,
      // have it join the channel and then retry the API call
      if (e.data.error === "not_in_channel") {
        await client.conversations.join({ channel: channel_id });
        const result = await client.conversations.history({
          channel: channel_id,
          oldest: message_id,
          limit: 1,
          inclusive: true,
        });

        messages = [
          { role: "system", content: DEFAULT_SYSTEM_CONTENT },
          { role: "user", content: result.messages[0].text },
        ];
      } else {
        console.error(e);
      }
    }

    const modelResponse = await hfClient.chatCompletion({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages,
      max_tokens: 2000,
    });

    await complete({
      outputs: {
        message: convertMarkdownToSlack(
          modelResponse.choices[0].message.content,
        ),
      },
    });
  } catch (error) {
    console.error(error);
    fail({ error: `Failed to complete the step: ${error}` });
  }
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log("⚡️ Code Assistant app is running!");
  } catch (error) {
    console.error("Failed to start app:", error);
  }
})();
```

This is the meat of our app! Here's a breakdown of what we've added:
* `DEFAULT_SYSTEM_CONTENT` is a set of instructions for the model; think of it as setting the scene in the play that is the interaction between your users and the AI model; it is the context for the role that the model will be playing.
* `convertMarkdownToSlack` is a function that converts traditional markdown to the markdown that Slack uses (which is different). Alternatively, you could send the model's response through the [markdown block](https://docs.slack.dev/reference/block-kit/blocks/markdown-block) to achieve the same result.
* `assistant` is an instance of the [`Assistant` class](/bolt-js/concepts/ai-apps#the-assistant-class-instance); this sets up the suggested prompts that the user sees in the split-view container upon opening your app. 
* `userMessage` is the handler that takes care of the fiddly bits around getting the thread history, preparing the structure of the messages for processing in a way that the model is expecting, interacting with the model, and responding to the user. 
* `app.function` sets up the custom function that can be used to achieve the same result of `userMessage` but as a custom step in a workflow built in Workflow Builder 🎉 This is the implementation logic of the custom workflow step we saw created by the manifest in the app settings. We use the [`conversations.history`](https://docs.slack.dev/reference/methods/conversations.history) method to find the message where the emoji reaction was placed, then send that to the model as the question.

### Run the app {#run}

We are ready to run the app. Navigate to your terminal window and run the following command:

```bash
npm start
```

If your app is up and running, you'll see a message that says `⚡️ Code Assistant app is running!`.

## Run your app in Slack {#run-in-slack}

With your app running, head over to the Slack client and open your app from the icon in the upper right of the window. If you don't see it there, open your Preferences by clicking on your workspace name, then **Preferences**, then **Navigation**. Under a section that says **App agents & assistants**, check the box next to your app. Note: if you do not see the **App agents & assistants** section, check that your app is installed both to your organization and your workspace. 

You should now see it and be able to open it from the icon in the upper right of the Slack client window. This opens the split-view. Upon opening your app's split-view, you should see the suggested prompts we set up in `app.js` file. Click on one of the suggested prompts or formulate a question of your own to see your AI app in action!

## Side quest: Use your function as a custom step in Workflow Builder {#custom-step}
Let's explore how to use the functionality you've created in your app inside of a workflow. In case you're unfamiliar, Workflow Builder is the no-code solution for executing tasks in Slack. Once your app is installed on your org, you can grant anyone access to use its function as a custom step in their workflow. Here's how that's done.

1. Open Workflow Builder by clicking on your workspace name in Slack, then hovering over **Tools** and clicking on **Workflow Builder**.
2. Click the button to create a **New Workflow**, then **Build Workflow**.
3. Select an event for how you will start your workflow. For this example, choose **When an emoji reaction is used**, then add the robot emoji 🤖, as well as which channels you'd like the workflow to work in. Confirm your selection by clicking **Continue**.
4. Select **Add steps**, then in the search bar, search for your app `Code Assist` and select it. This is your function as a custom step!
5. Click the `{}` next to **Message ID** and select **Time when the reacted message was sent**. Once it populates the box, click on the down arrow next to it and select **Timestamp**. Then, under **Channel ID**, select **The channel where the reacted message is in**, then **Save**.
6. Now that we have the app concocting a reply to the question in the message that was reacted to with the robot emoji, we need to do something with it. Let's post it in the channel where the question originated so that all interested parties know the answer.
7. Click **Add Step** once more, then **Messages**. Select **Send a message to a channel** and choose **The channel where the reacted message is in**. Below the message composer box, click **Insert a variable**, and under `Code Assist`, select **Answer**. This is the output of our custom function, as we defined it back in the [manifest](#create-app) from which the app was created. Click **Save**.
6. Now it's time to publish our workflow. Click **Finish Up** in the upper right, give your workflow a name, then **Publish**.

Test it out by navigating to a channel that you allowed the workflow to work in and post a question. React to that message with the robot 🤖 emoji. Wait and be amazed as your app works behind the scenes to reach out to the Hugging Face model and respond appropriately! 