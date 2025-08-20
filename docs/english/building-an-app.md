# Building an app with Bolt for JavaScript

This guide will walk you through creating and using a Slack app built with Bolt for JavaScript. On this journey, you'll:

- set up your local environment,
- create a new Slack app,
- and enable it to listen for and respond to messages within a Slack workspace.

When you’re finished, you’ll have created the [Getting Started app](https://github.com/slack-samples/bolt-js-getting-started-app) to run, modify, and make your own. ⚡️

:::tip[Less reading, more doing]

Follow the [quickstart](/tools/bolt-js/getting-started) guide to run an app as soon as possible. This guide will more thoroughly explore building your first app using Bolt for JavaScript.

:::

## Prerequisites

:::info[A place to belong]

You'll need a workspace where development can happen. We recommend using [developer sandboxes](/tools/developer-sandboxes/) to avoid disruptions where real work gets done.

:::

We recommend using the [**Slack CLI**](/tools/slack-cli/) for the smoothest experience, but you can also choose to follow along in the terminal as long as you have Node.js.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

Install the latest version of the Slack CLI for your operating system of choice by following the corresponding guide:

- [Slack CLI for macOS & Linux](/tools/slack-cli/guides/installing-the-slack-cli-for-mac-and-linux)
- [Slack CLI for Windows](/tools/slack-cli/guides/installing-the-slack-cli-for-windows)

Then confirm the Slack CLI is successfully installed by running the following command:

```sh
$ slack version
```

You'll also need to log in if this is your first time using the Slack CLI.

```sh
$ slack login
```

</TabItem>
<TabItem value="terminal" label="Terminal">

You can follow along in this guide as long as you have Node installed. We recommend the latest active release:

- [Node.js](https://nodejs.org/en/download)

Once installed, make sure the right version is being used:

```sh
$ node --version
```

</TabItem>
</Tabs>

## Initializing the project {#initializing-a-project}

With your toolchain configured, you can now set up a new Bolt project. This is where you'll write the code that handles the logic of your app.

If you don’t already have a project, let’s create a new one!

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

In this guide, we'll be scaffolding this project with the [`bolt-js-blank-template`](https://github.com/slack-samples/bolt-js-blank-template) template.

```sh
$ slack create first-bolt-app --template slack-samples/bolt-js-blank-template
$ cd first-bolt-app
```

After your project is created you will see a `package.json` file with project details and a `.slack` directory for application use.

A few other files exist too, but we'll visit these later.

</TabItem>
<TabItem value="terminal" label="Terminal">

Create and move into a new directory before you initialize the project:

```sh
$ mkdir first-bolt-app
$ cd first-bolt-app
$ npm init
```

You’ll be prompted with a series of questions to describe your new project (you can accept the defaults by hitting <kbd>Enter</kbd> on each prompt if you aren’t picky). After you’re done, you’ll have a new `package.json` file in your directory.

Next we'll install the Bolt for JavaScript package to the project's dependencies:

```sh
$ npm install @slack/bolt
```

</TabItem>
</Tabs>

Outlines of a project are taking shape, so let's move onto creating an app!

## Creating the app {#creating-an-app}

Before you can begin developing with Bolt for JavaScript, you'll want to create a Slack app.

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

The scaffolded blank template contains a `manifest.json` file with the app details for the app we are creating and installing.

Run the following command to create a new "local" app and choose a Slack team for development:

```sh
$ slack install
```

Your new app will have some placeholder values and a small set of [scopes](/reference/scopes) to start, but we'll explore more customizations soon.

</TabItem>
<TabItem value="terminal" label="App Settings">

Navigate to your list of apps within App Settings and [create a new Slack app](https://api.slack.com/apps/new) from scratch.

After you fill out an app name (this can be changed later) and pick a workspace to install it to, press the `Create App` button and you'll land on your app's **Basic Information** page.

![Basic Information page](/img/bolt-js/basic-information-page.png "Basic Information page")

Look around, add an app icon and description, and then let's start configuring your app. 🔩

#### Installing the app {#installing-the-app}

Slack apps [use OAuth to manage access](/authentication/installing-with-oauth) to the various Slack APIs. When an app is installed, you'll receive a token that the app can use to call API methods.

There are three main [token types](/authentication/tokens) available to a Slack app: user (`xoxp`), bot (`xoxb`), and app (`xapp`) tokens:

- [User tokens](/authentication/tokens#user) allow you to call API methods on behalf of users after they install or authenticate the app. There may be several user tokens for a single workspace.
- [Bot tokens](/authentication/tokens#bot) are associated with bot users, and are only granted once in a workspace where someone installs the app. The bot token your app uses will be the same no matter which user performed the installation. Bot tokens are the token type that _most_ apps use.
- [App-level tokens](/authentication/tokens#app-level) represent your app across organizations, including installations by all individual users on all workspaces in a given organization. App-level tokens are commonly used for creating websocket connections to your app.

We're going to use bot and app tokens for this guide.

1. Within App Settings, navigate to **OAuth & Permissions** in the left sidebar. Then scroll down to the **Bot Token Scopes** section. Click **Add an OAuth Scope**.
2. For now, we'll just add one scope: [`chat:write`](/reference/scopes/chat.write). This scope grants your app the permission to post messages in channels it's a member of.
3. Scroll up to the top of the **OAuth & Permissions** page and click **Install to Team**. You'll be led through Slack's OAuth UI, where you should allow your app to be installed to your development workspace.
4. Once you authorize the installation, you'll land on the **OAuth & Permissions** page and see a **Bot User OAuth Access Token**.

![OAuth Tokens](/img/bolt-js/bot-token.png "Bot OAuth Token")

You'll need to save the generated **bot token** as an environment variable. Copy your bot token beginning with `xoxb` and insert it into the following command:

```sh
$ export SLACK_BOT_TOKEN=xoxb-<your-bot-token>
```

The above example works on Linux and macOS, but [similar commands are available on Windows](https://superuser.com/questions/212150/how-to-set-env-variable-in-windows-cmd-line/212153#212153).

:::danger[Keep your tokens and signing secret secure]

At a minimum, you should avoid checking tokens and signing secrets into public version control, and you should access them via environment variables as shown above. Check out the API docs for more [app security best practices](/authentication/best-practices-for-security).

:::

</TabItem>
</Tabs>

## Preparing to receive events {#preparing-receive-events}

Let's now start your app to receive events from the [Events API](/apis/events-api). We'll listen and respond to certain events soon!

There are two paths for connecting your app to receive events:

- **Socket Mode**: For those just starting, we recommend using [Socket Mode](/apis/events-api/using-socket-mode/). Socket Mode allows your app to use the Events API and interactive features without exposing a public HTTP Request URL. This can be helpful during development, or if you're receiving requests from behind a firewall.
- **Request URL**: Alternatively, you're welcome to set up an app with public HTTP [Request URLs](/apis/events-api/using-http-request-urls). HTTP is more useful for apps being deployed to hosting environments (like [AWS](/tools/bolt-js/deployments/aws-lambda) or [Heroku](/tools/bolt-js/deployments/heroku)) to stably respond within large Slack organizations, or apps intended for distribution via the Slack Marketplace.

We've provided instructions for both ways in this guide, choose your flavor and let's carry on.

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

:::tip[The Slack CLI template does not require Socket Mode configurations]

The template we used to start with the Slack CLI is configured to use Socket Mode out of the box! [Skip to the _Running the app_ section](#running-the-app).

:::

First you'll need to enable events from [app settings](https://api.slack.com/apps):

1. Click **Event Subscriptions** on the left sidebar. Toggle the switch labeled **Enable Events**.
2. Navigate to **Socket Mode** on the left side menu and toggle **Enable Socket Mode** on.
3. Go to **Basic Information** and scroll down under the App-Level Tokens section and click **Generate Token and Scopes** to generate an app token. Add the `connections:write` scope to this token and save the generated `xapp` token, we'll use that in just a moment.

When an event occurs, Slack will send your app information about the event, like the user that triggered it and the channel it occurred in. Your app will process the details and can respond accordingly.

Back in your project, store the `xapp` token you created earlier in your environment.

```sh
$ export SLACK_APP_TOKEN=xapp-<your-app-token>
```

Create a new entrypoint file called `app.js` in your project directory and add the following code:

```javascript title="app.js"
const { App } = require("@slack/bolt");

// Initializes your app with your Slack app and bot token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

(async () => {
  // Start your app
  await app.start();

  app.logger.info("⚡️ Bolt app is running!");
})();
```

</TabItem>
<TabItem value="http" label="HTTP">

:::info[For local development, you can use a proxy service like [ngrok](https://ngrok.com/) to create a public URL and tunnel requests to your development environment.]

Refer to [ngrok's getting started guide](https://ngrok.com/docs/getting-started/) on how to create this tunnel.

:::

First you'll need a signing secret to verify that the requests sent to your app are from Slack.

1. Go to the **Basic Information** page on [app settings](https://api.slack.com/apps) and copy your Signing Secret to store in a new environment variable:

```sh
$ export SLACK_SIGNING_SECRET=<your-signing-secret>
```

2. Create a new entrypoint file called `app.js` in your project directory and add the following code:

```javascript title="app.js"
const { App } = require("@slack/bolt");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info("⚡️ Bolt app is running!");
})();
```

3. Next let's start your app to receive events. Run the following command in the terminal:

```sh
$ node app.js
```

Then enable events from app settings:

4. Click **Event Subscriptions** on the left sidebar. Toggle the switch labeled **Enable Events**.
5. Add your [Request URL](/apis/events-api/#subscribing) and click **Save Changes**. Slack will send HTTP POST requests corresponding to events to this Request URL endpoint.

You can now stop the app by pressing `CTRL+C` in the terminal.

:::warning[Can you hear me now?]

Bolt uses the `/slack/events` path to listen to all incoming requests (whether shortcuts, events, or interactivity payloads).

When configuring your Request URL within your app configuration, you'll append `/slack/events`:

```text
https://example.ngrok.io/slack/events
```

:::

</TabItem>
</Tabs>

With the app constructed, save your `app.js` file.

## Running the app {#running-the-app}

Now let's actually run your app! From the command line run the following:

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

```sh
$ slack run
```

</TabItem>
<TabItem value="terminal" label="Terminal">

```sh
$ node app.js
```

</TabItem>
</Tabs>

Your app should let you know that it's up and running. It's not actually listening for anything though. Let's change that.

Stop your app by pressing `CTRL+C` in the terminal then read on.

## Subscribing to events {#subscribing-to-events}

Your app behaves similarly to people on your team — it can post messages, add emoji reactions, and listen and respond to events.

To listen for events happening in a Slack workspace (like when a message is posted or when a reaction is posted to a message) you'll use the [Events API](/apis/events-api/) to subscribe to event types.

Open [app settings](https://api.slack.com/apps) for your app and find the **Event Subscriptions** tab, toggle "Enable Events" on, then scroll down to **Subscribe to Bot Events**. There are four events related to messages:

- [`message.channels`](/reference/events/message.channels) listens for messages in public channels that your app is added to
- [`message.groups`](/reference/events/message.groups) listens for messages in 🔒 private channels that your app is added to
- [`message.im`](/reference/events/message.im) listens for messages in your app's DMs with users
- [`message.mpim`](/reference/events/message.mpim) listens for messages in multi-person DMs that your app is added to

If you want your bot to listen to messages from everywhere it is added to, choose all four message events. After you’ve selected the events you want your bot to listen to, click the green **Save Changes** button.

You will also have to reinstall the app since new scopes are added for these events. Return to the **Install App** page to reinstall the app to your team.

## Listening and responding to messages {#listening-and-responding-to-messages}

Your app is now ready for some logic. Let's start by using the [`message`](/tools/bolt-js/concepts/message-listening) method to attach a listener for messages.

The following example listens and responds to all messages in channels/DMs where your app has been added that contain the word "hello". Insert the highlighted lines into `app.js`.

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

```javascript title="app.js"
const { App } = require("@slack/bolt");

// Initializes your app with your Slack app and bot token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// highlight-start
// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});
// highlight-end

(async () => {
  // Start your app
  await app.start();

  app.logger.info("⚡️ Bolt app is running!");
})();
```

</TabItem>
<TabItem value="http" label="HTTP">

```javascript title="app.js"
const { App } = require("@slack/bolt");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// highlight-start
// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});
// highlight-end

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info("⚡️ Bolt app is running!");
})();
```

</TabItem>
</Tabs>

Then restart your app. So long as your bot user has been added to the conversation, it will respond when you send any message that contains "hello".

This is a basic example, but it gives you a place to start customizing your app based on your own goals. Let's try something a little more interactive by sending a button rather than plain text.

## Sending and responding to actions {#sending-and-responding-to-actions}

To use features like buttons, select menus, datepickers, modals, and shortcuts, you’ll need to enable interactivity.

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

With Socket Mode on, basic interactivity is enabled for us by default, so no further action here is needed.

</TabItem>
<TabItem value="http" label="HTTP">

Similar to events, you'll need to specify a Request URL for Slack to send the action (such as _user clicked a button_).

Head over to **Interactivity & Shortcuts** in app settings.

By default, Bolt uses the same endpoint for interactive components that it uses for events, so use the same request URL as above (in the example, it was `https://example.ngrok.io/slack/events`). Press the **Save Changes** button in the lower right hand corner, and that's it. Your app is set up to handle interactivity!

</TabItem>
</Tabs>

When interactivity is enabled, interactions with shortcuts, modals, or interactive components (such as buttons, select menus, and datepickers) will be sent to your app as events.

Now, let’s go back to your app’s code and add logic to handle those events:

- First, we'll send a message that contains an interactive component (in this case a button).
- Next, we'll listen for the action of a user clicking the button before responding.

Below, the `app.js` file from the last section is modified to send a message containing a button rather than just a string. Update the highlighted lines as shown:

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

```javascript title="app.js"
const { App } = require("@slack/bolt");

// Initializes your app with your Slack app and bot token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// highlight-start
// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me",
          },
          action_id: "button_click",
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});
// highlight-end

(async () => {
  // Start your app
  await app.start();

  app.logger.info("⚡️ Bolt app is running!");
})();
```

</TabItem>
<TabItem value="http" label="HTTP">

```javascript title="app.js"
const { App } = require("@slack/bolt");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// highlight-start
// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me",
          },
          action_id: "button_click",
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});
// highlight-end

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info("⚡️ Bolt app is running!");
})();
```

</TabItem>
</Tabs>

The value inside of `say()` is now an object that contains an array of `blocks`. [Blocks](/block-kit) are the building components of a Slack message and can range from text to images to datepickers. In this case, your app will respond with a section block that includes a button as an accessory. Since we're using `blocks`, the `text` is a fallback for notifications and accessibility.

You'll notice in the button `accessory` object, there is an `action_id`. This will act as a unique identifier for the button so your app can specify what action it wants to respond to.

:::tip[Use [Block Kit Builder](https://app.slack.com/block-kit-builder) to prototype your interactive messages.]

Block Kit Builder lets you (or anyone on your team) mock up messages and generates the corresponding JSON that you can paste directly in your app.

:::

Now, if you restart your app and say "hello" in a channel your app is in, you'll see a message with a button. But if you click the button, nothing happens (_yet!_).

Let's add a handler to send a follow-up message when someone clicks the button. Add the following highlighted lines to `app.js`:

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

```js reference {41-45}
https://github.com/slack-samples/bolt-js-getting-started-app/blob/main/app.js
```

</TabItem>
<TabItem value="http" label="HTTP">

```javascript title="app.js"
const { App } = require("@slack/bolt");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there <@${message.user}>!`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me",
          },
          action_id: "button_click",
        },
      },
    ],
    text: `Hey there <@${message.user}>!`,
  });
});

// highlight-start
app.action("button_click", async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});
// highlight-end

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info("⚡️ Bolt app is running!");
})();
```

</TabItem>
</Tabs>

We used `app.action()` to listen for the `action_id` that we named `button_click`. Restart your app, and then click the button; you'll see a new message from your app that says you clicked the button.

## Next steps {#next-steps}

You just built a [Bolt for JavaScript app](https://github.com/slack-samples/bolt-js-getting-started-app)! 🎉

Now that you have an app up and running, you can start exploring how to make your Bolt app truly yours. Here are some ideas about what to explore next:

- Read through the various concepts pages to learn about the different methods and features accessible to your Bolt app.
- Explore the different events your bot can listen to with the [`event`](/tools/bolt-js/concepts/event-listening) method. [View all of the events within the API docs](/reference/events).
- The Bolt framework allows you to [call Web API methods](/tools/bolt-js/concepts/web-api) with the client attached to your app. [View the over 200 methods within the API docs](/reference/methods).
