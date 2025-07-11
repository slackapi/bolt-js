---
title: Building an App with Bolt for JavaScript
sidebar_label: Building an App
---

This guide is meant to walk you through getting up and running with a Slack app using Bolt for JavaScript. Along the way, we’ll create a new Slack app, set up your local environment, and develop an app that listens and responds to messages from a Slack workspace.

When you’re finished, you’ll have created the [Getting Started app](https://github.com/slackapi/bolt-js-getting-started-app) to run, modify, and make your own. ⚡️

---

## Create an app {#create-an-app}

First thing's first: before you start developing with Bolt, you'll want to [create a Slack app](https://api.slack.com/apps/new).

:::tip[A place to test and learn]

We recommend using a workspace where you won't disrupt real work getting done — [you can create a new one for free](https://slack.com/get-started#create).

:::

After you fill out an app name (_you can change it later_) and pick a workspace to install it to, hit the `Create App` button and you'll land on your app's **Basic Information** page.

This page contains an overview of your app in addition to important credentials you'll need later, like the `Signing Secret` under the **App Credentials** header.

![Basic Information page](/img/basic-information-page.png "Basic Information page")

Look around, add an app icon and description, and then let's start configuring your app. 🔩

---

## Tokens and installing apps {#tokens-and-installing-apps}

Slack apps use [OAuth to manage access to Slack's APIs](https://docs.slack.dev/authentication/installing-with-oauth). When an app is installed, you'll receive a token that the app can use to call API methods.

There are three main token types available to a Slack app: user (`xoxp-...`), bot (`xoxb-...`), and app (`xapp-...`) tokens.

- [User tokens](https://docs.slack.dev/authentication/tokens#user) allow you to call API methods on behalf of users after they install or authenticate the app. There may be several user tokens for a single workspace.
- [Bot tokens](https://docs.slack.dev/authentication/tokens#bot) are associated with bot users, and are only granted once in a workspace where someone installs the app. The bot token your app uses will be the same no matter which user performed the installation. Bot tokens are the token type that _most_ apps use.
- [App-level tokens](https://docs.slack.dev/authentication/tokens#app-level) represent your app across organizations, including installations by all individual users on all workspaces in a given organization and are commonly used for creating websocket connections to your app.

We're going to use bot and app tokens for this guide.

1. Navigate to the **OAuth & Permissions** on the left sidebar and scroll down to the **Bot Token Scopes** section. Click **Add an OAuth Scope**.

2. For now, we'll just add one scope: [`chat:write`](https://docs.slack.dev/reference/scopes/chat.write). This scope grants your app the permission to post messages in channels it's a member of.

3. Scroll up to the top of the OAuth & Permissions page and click **Install App to Workspace**. You'll be led through Slack's OAuth UI, where you should allow your app to be installed to your development workspace.

4. Once you authorize the installation, you'll land on the **OAuth & Permissions** page and see a **Bot User OAuth Access Token**.

![OAuth Tokens](/img/bot-token.png "Bot OAuth Token")

:::tip[Not sharing is sometimes caring]

Treat your token like a password and [keep it safe](https://docs.slack.dev/authentication/best-practices-for-security). Your app uses it to post and retrieve information from Slack workspaces.

:::

---

## Setting up your project {#setting-up-your-project}

With the initial configuration handled, it's time to set up a new Bolt project. This is where you'll write the code that handles the logic for your app.

If you don’t already have a project, let’s create a new one. Create an empty directory and initialize a new project:

```shell
mkdir first-bolt-app
cd first-bolt-app
npm init
```

You’ll be prompted with a series of questions to describe your new project (you can accept the defaults by hitting <kbd>Enter</kbd> on each prompt if you aren’t picky). After you’re done, you’ll have a new `package.json` file in your directory.

Before we install the Bolt for JavaScript package to your new project, let's save the **bot token** and **Signing Secret** that were generated when you configured your app.

1. **Copy your Signing Secret from the Basic Information page** and then store it in a new environment variable. The following example works on Linux and macOS; but [similar commands are available on Windows](https://superuser.com/questions/212150/how-to-set-env-variable-in-windows-cmd-line/212153#212153).

```shell
export SLACK_SIGNING_SECRET=<your-signing-secret>
```

2. **Copy your bot (xoxb) token from the OAuth & Permissions page** and store it in another environment variable.

```shell
export SLACK_BOT_TOKEN=xoxb-<your-bot-token>
```

:::warning[Keep it secret. Keep it safe]

Remember to keep your tokens and signing secret secure. At a minimum, you should avoid checking them into public version control, and access them via environment variables as we've done above. Checkout the API documentation for more on [best practices for app security](https://docs.slack.dev/authentication/best-practices-for-security).

:::

Now, let's create your app. Install the `@slack/bolt` package and save it to your `package.json` dependencies using the following command:

```shell
npm install @slack/bolt
```

Create a new entrypoint file called `app.js` in this directory and add the following code:

```javascript
const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info('⚡️ Bolt app is running!');
})();
```

Save your `app.js` file, then on the command line run the following:

```script
node app.js
```

Your app should let you know that it's up and running. 🎉

---

## Setting up events {#setting-up-events}

Your app behaves similarly to people on your team — it can post messages, add emoji reactions, and listen and respond to events.

To listen for events happening in a Slack workspace (like when a message is posted or when a reaction is posted to a message) you'll use the [Events API to subscribe to event types](https://docs.slack.dev/apis/events-api/).

For those just starting, we recommend using [Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/). Socket Mode allows your app to use the Events API and interactive features without exposing a public HTTP Request URL. This can be helpful during development, or if you're receiving requests from behind a firewall.

That being said, you're welcome to set up an app with a public HTTP Request URL. HTTP is more useful for apps being deployed to hosting environments (like [AWS](/deployments/aws-lambda) or [Heroku](/deployments/heroku)) to stably respond within a large corporate Slack workspaces/organization, or apps intended for distribution via the Slack Marketplace.

We've provided instructions for both ways in this guide.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

1. Head to your app's configuration page (click on the app [from your app settings page](https://api.slack.com/apps)). Navigate to **Socket Mode** on the left side menu and toggle to enable.

2. Go to **Basic Information** and scroll down under the App-Level Tokens section and click **Generate Token and Scopes** to generate an app token. Add the `connections:write` scope to this token and save the generated `xapp` token, we'll use that in just a moment.

3. Finally, it's time to tell Slack what events we'd like to listen for. Under **Event Subscriptions**, toggle the switch labeled **Enable Events**.

When an event occurs, Slack will send your app information about the event, like the user that triggered it and the channel it occurred in. Your app will process the details and can respond accordingly.

</TabItem>
<TabItem value="http" label="HTTP">

1. Go back to your app configuration page (click on the app from your [app settings page](https://api.slack.com/apps)). Click **Event Subscriptions** on the left sidebar. Toggle the switch labeled **Enable Events**.

2. Add your Request URL. Slack will send HTTP POST requests corresponding to events to this [Request URL](https://docs.slack.dev/apis/events-api/#subscribing) endpoint. Bolt uses the `/slack/events` path to listen to all incoming requests (whether shortcuts, events, or interactivity payloads). When configuring your Request URL within your app configuration, you'll append `/slack/events`, e.g. `https://<your-domain>/slack/events`. 💡

:::info[Using proxy services]

For local development, you can use a proxy service like [ngrok](https://ngrok.com/) to create a public URL and tunnel requests to your development environment. Refer to [ngrok's getting started guide](https://ngrok.com/docs#getting-started-expose) on how to create this tunnel.

:::

</TabItem>
</Tabs>

Scroll down to **Subscribe to Bot Events**. There are four events related to messages:

- [`message.channels`](https://docs.slack.dev/reference/events/message.channels) listens for messages in public channels that your app is added to.
- [`message.groups`](https://docs.slack.dev/reference/events/message.groups) listens for messages in 🔒 private channels that your app is added to.
- [`message.im`](https://docs.slack.dev/reference/events/message.im) listens for messages in your app's DMs with users.
- [`message.mpim`](https://docs.slack.dev/reference/events/message.mpim) listens for messages in multi-person DMs that your app is added to.

If you want your bot to listen to messages from everywhere it is added to, choose all four message events. After you’ve selected the events you want your bot to listen to, click the green **Save Changes** button.

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

Back in your project, make sure to store the `xapp` token you saved earlier in your environment.

```shell
export SLACK_APP_TOKEN=xapp-<your-app-token>
```

Change your Bolt initialization code and restart the app.

```javascript
// Initializes your app in socket mode with your app token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN, // add this
});
```

</TabItem>
<TabItem value="http" label="HTTP">

Carry on!

</TabItem>
</Tabs>

---

## Listening and responding to a message {#listening-and-responding-to-a-message}

Your app is now ready for some logic. Let's start by using the `message()` method to attach a listener for messages.

The following example listens and responds to all messages in channels/DMs where your app has been added that contain the word "hello":

<Tabs groupId="socket-or-http">
  <TabItem value="socket-mode" label="Socket Mode">

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start();

  app.logger.info('⚡️ Bolt app is running!');
})();
```

  </TabItem>
  <TabItem value="http" label="HTTP">

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info('⚡️ Bolt app is running!');
})();
```

  </TabItem>
</Tabs>

If you restart your app, so long as your bot user has been added to the channel or DM conversation, when you send any message that contains "hello", it will respond.

This is a basic example, but it gives you a place to start customizing your app based on your own goals. Let's try something a little more interactive by sending a button rather than plain text.

---

## Sending and responding to actions {#sending-and-responding-to-actions}

To use features like buttons, select menus, datepickers, modals, and shortcuts, you’ll need to enable interactivity. Head over to **Interactivity & Shortcuts** in your app configuration.

<Tabs groupId="socket-or-http">
<TabItem value="socket-mode" label="Socket Mode">

With Socket Mode on, basic interactivity is enabled for us by default, so no further action here is needed

</TabItem>
<TabItem value="http" label="HTTP">

Similar to events, you'll need to specify a Request URL for Slack to send the action (such as _user clicked a button_).

By default, Bolt uses the same endpoint for interactive components that it uses for events, so use the same request URL as above (in the example, it was `https://8e8ec2d7.ngrok.io/slack/events`). Press the **Save Changes** button in the lower right hand corner, and that's it. Your app is set up to handle interactivity!

</TabItem>
</Tabs>

When interactivity is enabled, interactions with shortcuts, modals, or interactive components (such as buttons, select menus, and datepickers) will be sent to your app as events.

Now, let’s go back to your app’s code and add logic to handle those events:

- First, we'll send a message that contains an interactive component (in this case a button).
- Next, we'll listen for the action of a user clicking the button before responding.

Below, the code from the last section is modified to send a message containing a button rather than just a string:

<Tabs groupId="socket-or-http">
  <TabItem value="socket-mode" label="Socket Mode">

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
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

(async () => {
  // Start your app
  await app.start();

  app.logger.info('⚡️ Bolt app is running!');
})();
```

  </TabItem>
  <TabItem value="http" label="HTTP">

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
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

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info('⚡️ Bolt app is running!');
})();
```

  </TabItem>
</Tabs>

The value inside of `say()` is now an object that contains an array of `blocks`. Blocks are the building components of a Slack message and can range from text to images to datepickers. In this case, your app will respond with a section block that includes a button as an accessory. Since we're using `blocks`, the `text` is a fallback for notifications and accessibility.

You'll notice in the button `accessory` object, there is an `action_id`. This will act as a unique identifier for the button so your app can specify what action it wants to respond to.

:::tip[Using Block Kit Builder]

The [Block Kit Builder](https://app.slack.com/block-kit-builder) is a simple way to prototype your interactive messages. The builder lets you (or anyone on your team) mock up messages and generates the corresponding JSON that you can paste directly in your app.

:::

Now, if you restart your app and say "hello" in a channel your app is in, you'll see a message with a button. But if you click the button, nothing happens (_yet!_).

Let's add a handler to send a followup message when someone clicks the button:

<Tabs groupId="socket-or-http">
  <TabItem value="socket-mode" label="Socket Mode">

```js reference
https://github.com/slack-samples/bolt-js-getting-started-app/blob/main/app.js
```

  </TabItem>
  <TabItem value="http" label="HTTP">

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
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

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  app.logger.info('⚡️ Bolt app is running!');
})();
```

  </TabItem>
</Tabs>

You can see that we used `app.action()` to listen for the `action_id` that we named `button_click`. If you restart your app and click the button, you'll see a new message from your app that says you clicked the button.

---

## Next steps {#next-steps}

You just built your first [Bolt for JavaScript app](https://github.com/slack-samples/bolt-js-getting-started-app)! 🎉

Now that you have a basic app up and running, you can start exploring how to make your Bolt app stand out. Here are some ideas about what to explore next:

- Read through the concepts pages to learn about the different methods and features your Bolt app has access to.

- Explore the different events your bot can listen to with the [`events()`](/concepts/event-listening) method. All of the events are listed on the [API docs site](https://docs.slack.dev/reference/events).

- Bolt allows you to [call Web API methods](/concepts/web-api) with the client attached to your app. There are [over 200 methods](https://docs.slack.dev/reference/methods) on the API docs site.

- Learn more about the different token types [on the API docs site](https://docs.slack.dev/authentication/tokens). Your app may need different tokens depending on the actions you want it to perform.
