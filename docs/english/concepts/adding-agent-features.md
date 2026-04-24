---
sidebar_label: Adding agent features
---

# Adding agent features with Bolt for JavaScript

:::tip[Check out the Support Agent sample app]
The code snippets throughout this guide are from our [Support Agent sample app](https://github.com/slack-samples/bolt-js-support-agent), Casey, which supports integration with the Claude Agent SDK and OpenAI Agents SDK. 

View our [agent quickstart](/ai/agent-quickstart) to get up and running with Casey. Otherwise, read on for exploration and explanation of agent-focused Bolt features found within Casey.
:::

Your agent can utilize features applicable to messages throughout Slack, like [chat streaming](#text-streaming) and [feedback buttons](#adding-and-handling-feedback). They can also [utilize the `Assistant` class](/tools/bolt-js/concepts/assistant-class) for a side-panel view designed with AI in mind.

If you're unfamiliar with using these feature within Slack, you may want to read the [API docs on the subject](/ai/). Then come back here to implement them with Bolt!

---

## Slack MCP Server {#slack-mcp-server}

Casey can harness the [Slack MCP Server](https://docs.slack.dev/ai/slack-mcp-server/developing) when deployed via an HTTP Server with OAuth. 

To enable the Slack MCP Server:

1. Install [ngrok](https://ngrok.com/download) and start a tunnel:

```sh
ngrok http 3000
```

2. Copy the `https://*.ngrok-free.app` URL from the ngrok output.

3. Update `manifest.json` for HTTP mode:
   - Set `socket_mode_enabled` to `false`
   - Replace `ngrok-free.app` with your ngrok domain (e.g. `YOUR_NGROK_SUBDOMAIN.ngrok-free.app`)

4. Create a new local dev app:

```sh
slack install -E local
```

5. Enable MCP for your app:
   - Run `slack app settings` to open your app's settings
   - Navigate to **Agents & AI Apps** in the left-side navigation
   - Toggle **Model Context Protocol** on

6. Update your `.env` OAuth environment variables:
   - Run `slack app settings` to open App Settings
   - Copy **Client ID**, **Client Secret**, and **Signing Secret**
   - Update `SLACK_REDIRECT_URI` in `.env` with your ngrok domain

```sh
SLACK_CLIENT_ID=YOUR_CLIENT_ID
SLACK_CLIENT_SECRET=YOUR_CLIENT_SECRET
SLACK_SIGNING_SECRET=YOUR_SIGNING_SECRET
SLACK_REDIRECT_URI=https://YOUR_NGROK_SUBDOMAIN.ngrok-free.app/slack/oauth_redirect
```

7. Start the app:

```sh
slack run app-oauth.js
```

8. Click the install URL printed in the terminal to install the app to your workspace via OAuth.

Your agent can now access the Slack MCP server!

---

## Listening for user invocation 

Agents can be invoked throughout Slack, such as via @mentions in channels, messaging the agent, and using the assistant side panel. 

<Tabs>
<TabItem value="appmention" label = "App mention">

```javascript title="
import { runCaseyAgent } from '../../agent/index.js';
import { sessionStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';

export async function handleAppMentioned({ client, context, event, logger, say, sayStream, setStatus }) {
  try {
    const channelId = event.channel;
    const text = event.text || '';
    const threadTs = event.thread_ts || event.ts;
    const userId = context.userId;

    // Strip the bot mention from the text
    const cleanedText = text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!cleanedText) {
      await say({
        text: "Hey there! How can I help you? Describe your IT issue and I'll do my best to assist.",
        thread_ts: threadTs,
      });
      return;
    }

    // Add eyes reaction only to the first message (not threaded replies)
    if (!event.thread_ts) {
      await client.reactions.add({
        channel: channelId,
        timestamp: event.ts,
        name: 'eyes',
      });
    }

    ...
```

</TabItem>
<TabItem value="message" label = "Message">

```javascript
import { runCaseyAgent } from '../../agent/index.js';
import { sessionStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';

function isGenericMessageEvent(event) {
  return !('subtype' in event && event.subtype !== undefined);
}

function getIssueMetadata(event) {
  const metadata = event.metadata;
  return metadata?.event_type === 'issue_submission' ? metadata : null;
}

export async function handleMessage({ client, context, event, logger, say, sayStream, setStatus }) {
  // Skip message subtypes (edits, deletes, etc.)
  if (!isGenericMessageEvent(event)) return;

  // Issue submissions are posted by the bot with metadata so the message
  // handler can run the agent on behalf of the original user.
  const issueMetadata = getIssueMetadata(event);

  // Skip bot messages that are not issue submissions.
  if (event.bot_id && !issueMetadata) return;

  const isDm = event.channel_type === 'im';
  const isThreadReply = !!event.thread_ts;

  if (isDm) {
    // DMs are always handled
  } else if (isThreadReply) {
    // Channel thread replies are handled only if the bot is already engaged
    const session = sessionStore.getSession(event.channel, event.thread_ts);
    if (session === null) return;
  } else {
    // Top-level channel messages are handled by app_mentioned
    return;
  }

  try {
    const channelId = event.channel;
    const text = event.text || '';
    const threadTs = event.thread_ts || event.ts;

    // For issue submissions the bot posted the message, so the real
    // user_id comes from the metadata rather than the event context.
    const userId = issueMetadata ? issueMetadata.event_payload.user_id : context.userId;

    const existingSessionId = sessionStore.getSession(channelId, threadTs);

    // Add eyes reaction only to the first message (DMs only — channel
    // threads already have the reaction from the initial app_mention)
    if (isDm && !existingSessionId) {
      await client.reactions.add({
        channel: channelId,
        timestamp: event.ts,
        name: 'eyes',
      });
    }

    ...
```

</TabItem>

<TabItem value="assistant" label = "Assistant thread">

```javascript
const SUGGESTED_PROMPTS = [
  { title: 'Reset Password', message: 'I need to reset my password' },
  { title: 'Request Access', message: 'I need access to a system or tool' },
  { title: 'Network Issues', message: "I'm having network connectivity issues" },
];

export async function handleAssistantThreadStarted({ client, event, logger }) {
  const { channel_id: channelId, thread_ts: threadTs } = event.assistant_thread;

  try {
    await client.assistant.threads.setSuggestedPrompts({
      channel_id: channelId,
      thread_ts: threadTs,
      title: 'How can I help you today?',
      prompts: SUGGESTED_PROMPTS,
    });
  } catch (e) {
    logger.error(`Failed to handle assistant thread started: ${e}`);
  }
}
```

</TabItem>
</Tabs>

---

## Setting status {#setting-assistant-status}

Your app can show its users action is happening behind the scenes by setting its thread status. 

```javascript
export async function handleAppMentioned({ setStatus, ...args }) {
  await setStatus({
    status: 'Thinking…',
    loading_messages: [
      'Teaching the hamsters to type faster…',
      'Untangling the internet cables…',
      'Consulting the office goldfish…',
      'Polishing up the response just for you…',
      'Convincing the AI to stop overthinking…',
    ],
  });
}
```

---

## Streaming messages {#text-streaming}

You can have your app's messages stream in to replicate conventional agent behavior. Bolt for JavaScript provides a `sayStream` utility as a listener argument available for `app.event` and `app.message` listeners. 

The `sayStream` utility streamlines calling the JavaScript Slack SDK's [`WebClient.chat.stream`](https://slack.dev/node-slack-sdk/web-api#streaming-messages) helper utility by sourcing parameter values from the relevant event payload.

| Parameter | Value |
|---|---| 
| `channel_id` | Sourced from the event payload.
| `thread_ts` | Sourced from the event payload. Falls back to the `ts` value if available.
| `recipient_team_id` | Sourced from the event `team_id` (`enterprise_id` if the app is installed on an org).
| `recipient_user_id` | Sourced from the `user_id` of the event.

If neither a `channel_id` or `thread_ts` can be sourced, then the utility will be `null`.

```javascript
app.message('*', async ({ sayStream }) => {
  const stream = sayStream();
  await stream.append({ markdown_text: "Here's my response..." });
  await stream.append({ markdown_text: "And here's more..." });
  await stream.stop();
});
```

---

## Adding and handling feedback {#adding-and-handling-feedback}

You can use the [feedback buttons block element](/reference/block-kit/block-elements/feedback-buttons-element/) to allow users to immediately provide feedback regarding the app's responses. Here's what the feedback buttons look like from the Support Agent sample app:

```javascript title=".../listeners/views/feedback-builder.js"
export function buildFeedbackBlocks() {
  return [
    {
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
    },
  ];
}
```

That feedback block is then rendered at the bottom of your app's message via the `sayStream` utility.

```javascript
// Stream response in thread with feedback buttons
const streamer = sayStream();
await streamer.append({ markdown_text: responseText });
const feedbackBlocks = buildFeedbackBlocks();
await streamer.stop({ blocks: feedbackBlocks });
```

You can also add a response for when the user provides feedback. 

```javascript title="...listeners/actions/feedback-buttons.js"
export async function handleFeedbackButton({ ack, body, client, context, logger }) {
  await ack();

  try {
    const userId = context.userId;
    const channelId = body.channel.id;
    const messageTs = body.message.ts;
    const feedbackValue = body.actions[0].value;

    if (feedbackValue === 'good-feedback') {
      await client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        thread_ts: messageTs,
        text: 'Glad that was helpful! :tada:',
      });
    } else {
      await client.chat.postEphemeral({
        channel: channelId,
        user: userId,
        thread_ts: messageTs,
        text: "Sorry that wasn't helpful. :slightly_frowning_face: Try rephrasing your question or I can create a support ticket for you.",
      });
    }

    logger.debug(`Feedback received: value=${feedbackValue}, message_ts=${messageTs}`);
  } catch (e) {
    logger.error(`Failed to handle feedback: ${e}`);
  }
}
```

---

## Full example

Putting all those concepts together results in a dynamic agent ready to helpfully respond.


<details>
<summary>Full example</summary>
<Tabs>
<TabItem value="claude" label = "Claude Agent SDK">

```javascript title="listeners/events/app-mentioned.js"
import { runCaseyAgent } from '../../agent/index.js';
import { sessionStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';

export async function handleAppMentioned({ client, context, event, logger, say, sayStream, setStatus }) {
  try {
    const channelId = event.channel;
    const text = event.text || '';
    const threadTs = event.thread_ts || event.ts;
    const userId = context.userId;

    // Strip the bot mention from the text
    const cleanedText = text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!cleanedText) {
      await say({
        text: "Hey there! How can I help you? Describe your IT issue and I'll do my best to assist.",
        thread_ts: threadTs,
      });
      return;
    }

    // Add eyes reaction only to the first message (not threaded replies)
    if (!event.thread_ts) {
      await client.reactions.add({
        channel: channelId,
        timestamp: event.ts,
        name: 'eyes',
      });
    }

    // Set assistant thread status with loading messages
    await setStatus({
      status: 'Thinking…',
      loading_messages: [
        'Teaching the hamsters to type faster…',
        'Untangling the internet cables…',
        'Consulting the office goldfish…',
        'Polishing up the response just for you…',
        'Convincing the AI to stop overthinking…',
      ],
    });

    // Get conversation session
    const existingSessionId = sessionStore.getSession(channelId, threadTs);

    // Run the agent with deps for tool access
    const deps = { client, userId, channelId, threadTs, messageTs: event.ts };
    const { responseText, sessionId: newSessionId } = await runCaseyAgent(cleanedText, existingSessionId, deps);

    // Stream response in thread with feedback buttons
    const streamer = sayStream();
    await streamer.append({ markdown_text: responseText });
    const feedbackBlocks = buildFeedbackBlocks();
    await streamer.stop({ blocks: feedbackBlocks });

    // Store conversation session
    if (newSessionId) {
      sessionStore.setSession(channelId, threadTs, newSessionId);
    }
  } catch (e) {
    logger.error(`Failed to handle app mention: ${e}`);
    await say({
      text: `:warning: Something went wrong! (${e})`,
      thread_ts: event.thread_ts || event.ts,
    });
  }
}
```

</TabItem>
<TabItem value="openai" label = "OpenAI Agents SDK">

```javascript title="listeners/events/app-mentioned.js"
import { run } from '@openai/agents';

import { CaseyDeps, caseyAgent } from '../../agent/index.js';
import { conversationStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';

export async function handleAppMentioned({ client, context, event, logger, say, sayStream, setStatus }) {
  try {
    const channelId = event.channel;
    const text = event.text || '';
    const threadTs = event.thread_ts || event.ts;
    const userId = context.userId;

    // Strip the bot mention from the text
    const cleanedText = text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!cleanedText) {
      await say({
        text: "Hey there! How can I help you? Describe your IT issue and I'll do my best to assist.",
        thread_ts: threadTs,
      });
      return;
    }

    // Add eyes reaction only to the first message (not threaded replies)
    if (!event.thread_ts) {
      await client.reactions.add({
        channel: channelId,
        timestamp: event.ts,
        name: 'eyes',
      });
    }

    // Set assistant thread status with loading messages
    await setStatus({
      status: 'Thinking…',
      loading_messages: [
        'Teaching the hamsters to type faster…',
        'Untangling the internet cables…',
        'Consulting the office goldfish…',
        'Polishing up the response just for you…',
        'Convincing the AI to stop overthinking…',
      ],
    });

    // Get conversation history
    const history = conversationStore.getHistory(channelId, threadTs);
    const inputItems = history ? [...history, { role: 'user', content: cleanedText }] : cleanedText;

    // Run the agent
    const deps = new CaseyDeps(client, userId, channelId, threadTs, event.ts);
    const result = await run(caseyAgent, inputItems, { context: deps });

    // Stream response in thread with feedback buttons
    const streamer = sayStream();
    await streamer.append({ markdown_text: result.finalOutput });
    const feedbackBlocks = buildFeedbackBlocks();
    await streamer.stop({ blocks: feedbackBlocks });

    // Store conversation history
    conversationStore.setHistory(channelId, threadTs, result.history);
  } catch (e) {
    logger.error(`Failed to handle app mention: ${e}`);
    await say({
      text: `:warning: Something went wrong! (${e})`,
      thread_ts: event.thread_ts || event.ts,
    });
  }
}
```

</TabItem>
</Tabs>
</details>

---

## Onward: adding custom tools

Casey comes with test tools and simulated systems. You can extend it with custom tools to make it a fully functioning Slack agent.

In this example, we'll add a tool that makes live calls to check the GitHub status.

1. Create `agent/tools/{tool-name}.js` and define the tool with the `tool()` function:

```javascript title="agent/tools/check-github-status.js"
import { tool } from '@anthropic-ai/claude-agent-sdk';

export const checkGitHubStatusTool = tool(
  'check_github_status',
  'Check GitHub\'s current operational status',
  {},
  async () => {
    const response = await fetch('https://www.githubstatus.com/api/v2/status.json');
    const data = await response.json();
    const status = data.status.indicator;
    const description = data.status.description;
    
    return {
      content: [
        {
          type: 'text',
          text: `**GitHub Status** — ${status}\n${description}`,
        }
      ]
    };
  }
);
```

2. Import the tool in `agent/casey.js`:

```javascript title="agent/casey.js"
import { checkGitHubStatusTool } from './tools/check-github-status.js';
```

3. Add to the tools array in `caseyToolsServer`:

```javascript title="agent/casey.js"
const caseyToolsServer = createSdkMcpServer({
  name: 'casey-tools',
  version: '1.0.0',
  tools: [
    checkGitHubStatusTool,  // Add here
    // ... other tools
  ],
});
```

4. Add to `CASEY_TOOLS`:

```javascript title="agent/casey.js"
const CASEY_TOOLS = [
  'check_github_status',  // Add here
  // ... other tools
];
```

Use this example as a jumping off point for building out an agent with the capabilities you need!