---
title: Getting started
order: 0
slug: getting-started
lang: en
layout: tutorial
permalink: /tutorial/getting-started
redirect_from:
  - /getting-started
---
# Getting started with Bolt

<div class="section-content">
This guide is meant to walk you through getting up and running with a Slack app using Bolt. Along the way, we’ll create a new Slack app, set up your local environment, and develop an app that listens and responds to messages from a Slack workspace.
</div> 

---

### Create an app
First thing's first: before you start developing with Bolt, you'll want to [create a Slack app](https://api.slack.com/apps/new). 

> 💡 We recommend using a workspace where you won't disrupt real work getting done — [you can create a new one for free](https://slack.com/get-started#create).

After you fill out an app name (_you can change it later_) and pick a workspace to install it to, hit the `Create App` button and you'll land on your app's **Basic Information** page.

This page contains an overview of your app in addition to important credentials you'll need later, like the `Signing Secret` under the **App Credentials** header. 

![Basic Information page](../assets/basic-information-page.png "Basic Information page")

Look around, add an app icon and description, and then let's start configuring your app 🔩

---

### Tokens and installing apps
Slack apps use [OAuth to manage access to Slack's APIs](https://api.slack.com/docs/oauth). When an app is installed, you'll receive a token that the app can use to call API methods. 

There are two token types available to a Slack app: user (`xoxp`) and bot (`xoxb`) tokens. User tokens allow you to call API methods on behalf of users after they install or authenticate the app. There may be several user tokens for a single workspace. Bot tokens are granted once in every workspace where someone installs the app, though they require adding a bot user to your app. The bot token your app uses will be the same no matter which user performed the installation.

For brevity, we're going to use bot tokens for this guide.

To add a bot user, click **Bot Users** on the left sidebar and then **Add A Bot User**. Give it a display name and username, then click **Add Bot User**.

Now that you have a bot user with permission to send messages to Slack, let's install the app to your workspace.

Click **Install App** on the left sidebar and click the **Install App to Workspace** button at the top of the page. You'll see a screen that details what permissions the app is requesting, which correlate to the scopes applied to your app's OAuth token(s).

Once you authorize the installation, you'll land on the **OAuth & Permissions** page.

![OAuth Tokens](../assets/bot-token.png "OAuth Tokens")

You'll see two tokens. For now, we'll just use the `xoxb` bot token. (If you scroll down this page to the **Scopes** section, you'll see the various scopes you can add to the `xoxp` token.)

> 💡 Treat your token like a password and [keep it safe](https://api.slack.com/docs/oauth-safety). Your app uses it to post and retrieve information from Slack workspaces.

### Setting up your local project
With the initial configuration handled, it's time to set up a new Bolt project. This is where you'll write the code that handles the logic for your app.

If you don’t already have a project, let’s create a new one. Create an empty directory and initialize a new project:

```shell
mkdir first-bolt-app
cd first-bolt-app
npm init
```

You’ll be prompted with a series of questions to describe your new project (you can accept the defaults by hitting <kbd>Enter</kbd> on each prompt if you aren’t picky). After you’re done, you’ll have a new `package.json` file in your directory.

Before we install the Bolt package to your new project, let's save the bot token and signing secret that was generated when you configured your app. These should be stored as environment variables and should *not* be saved in version control.

1. **Copy your Signing Secret from the Basic Information page** and then store it in a new environment variable. The following example works on Linux and MacOS; but [similar commands are available on Windows](https://superuser.com/questions/212150/how-to-set-env-variable-in-windows-cmd-line/212153#212153).

```shell
export SLACK_SIGNING_SECRET=<your-signing-secret>
```

2. **Copy your bot (xoxb) token from the OAuth & Permissions page** and store it in another environment variable.

```shell
export SLACK_BOT_TOKEN=xoxb-<your-bot-token>
```

Now, lets create your app. Install the `@slack/bolt` package and save it to your `package.json` dependencies using the following command:

```shell
npm install @slack/bolt
```

Create a new file called `app.js` in this directory and add the following code:

```javascript
const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

Your token and signing secret are enough to create your first Bolt app. Save your `app.js` file then on the command line run the following:

```script
node app.js
```

Your app should let you know that it's up and running.

---

### Setting up events
Your app behaves similarly to people on your team — it can post messages, add emoji reactions, and more. To listen for events happening in a Slack workspace (like when a message is posted or when a reaction is posted to a message) you'll use the [Events API to subscribe to event types](https://api.slack.com/events-api).

To enable events for your app, start by going back to your app configuration page (click on the app [from your app management page](https://api.slack.com/apps)). Click **Event Subscriptions** on the left sidebar. Toggle the switch labeled **Enable Events**. 

You'll see a text input labeled **Request URL**. The Request URL is a public URL where Slack will send HTTP POST requests corresponding to events you specify.

> ⚙️We've collected some of the most common hosting providers Slack developers use to host their apps [on our API site](https://api.slack.com/docs/hosting)

When an event occurs, Slack will send your app some information about the event, like the user that triggered it and the channel it occurred in. Your app will process the details and can respond accordingly.

<details>
<summary markdown="0">
<h4>Using a local Request URL for development</h4>
</summary>

If you’re just getting started with your app's development, you probably don’t have a publicly accessible URL yet. Eventually, you’ll want to set one up, but for now a development proxy like [ngrok](https://ngrok.com/) will create a public URL and tunnel requests to your own development environment. We've written a separate tutorial about [using ngrok with Slack for local development](https://api.slack.com/tutorials/tunneling-with-ngrok) that should help you get everything set up.

Once you’ve installed a development proxy, run it to begin forwarding requests to a specific port (we’re using port `3000` for this example, but if you customized the port used to initialize your app use that port instead):

```shell
ngrok http 3000
```

![Running ngrok](../assets/ngrok.gif "Running ngrok")

The output should show a generated URL that you can use (we recommend the one that starts with `https://`). This URL will be the base of your request URL, in this case `https://8e8ec2d7.ngrok.io`.

---
</details>

Now you have a public-facing URL for your app that tunnels to your local machine. The Request URL that you use in your app configuration is composed of your public-facing URL combined with the URL your app is listening on. By default, Bolt apps listen at `/slack/events` so our full request URL would be `https://8e8ec2d7.ngrok.io/slack/events`.

Under the **Enable Events** switch in the **Request URL** box, go ahead and paste in your URL. As long as your Bolt app is still running, your URL should become verified.

After your request URL is verified, scroll down to **Subscribe to Bot Events**. There are four events related to messages: `message.channels` (listens for messages in public channels), `message.groups` (listens for messages in private channels), `message.im` (listens for messages in the App Home/DM space), and `message.mpim` (listens for messages in multi-person DMs).

If you want your bot to listen to messages from everywhere it is, choose all four message events. After you’ve added the events you want your bot to listen to, click the green **Save Changes** button.

---

### Listening and responding to a message
Your app is now ready for some logic. Let's start by using the `message()` method to attach a listener for messages.

The following example listens to all messages that contain the word "hello" and responds with "Hey there @user!"

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

If you restart your app, you should be able to add your bot user to a channel, send any message that contains "hello", and it will respond.

This is a basic example, but it gives you a place to start customizing your app based on your own goals. Let's try something a little more interactive by sending a button rather than plain text.

---

### Sending and responding to actions

To use features like buttons, select menus, datepickers, dialogs, and message actions, you’ll need to enable interactivity. Similar to events, you'll need to specify a URL for Slack to send the action (such as *user clicked a button*).

Back on your app configuration page, click on **Interactive Components** on the left side. You'll see that there's another **Request URL** box.

By default, Bolt is configured to use the same endpoint for interactive components that it uses for events, so use the same request URL as above (in the example, it was `https://8e8ec2d7.ngrok.io/slack/events`). Press the **Save Changes** button in the lower right hand corner, and that's it. Your app is set up for interactivity!

![Configuring a Request URL](../assets/request-url-config.png "Configuring a Request URL")

Now, let's go back to your app's code and add interactivity. This will consist of two steps:
- First, your app will send a message that contains a button.
- Next, your app will listen to the action of a user clicking the button and respond

Below, I've modified the app code we wrote in the last section to send a message with a button rather than a string:

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say({
    blocks: [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Hey there <@${message.user}>!`
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Click Me"
        },
        "action_id": "button_click"
      }
    }
    ]
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

The value inside of `say()` is now an object that contains an array of `blocks`. Blocks are the building components of a Slack message and can range from text to images to datepickers. In this case, your app will respond with a section block that includes a button as an accessory.

You'll notice in the button `accessory` object, there is an `action_id`. This will act as a unique identifier for the button so your app can specify what action it wants to respond to.

> 💡 The [Block Kit Builder](https://api.slack.com/tools/block-kit-builder) is an simple way to prototype your interactive messages. The builder lets you (or anyone on your team) mockup messages and generates the corresponding JSON that you can paste directly in your app.

Now, if you restart your app and say "hello" in a channel your app is in, you'll see a message with a button. But if you click the button, nothing happens (*yet!*).

Let's add a handler to send a followup message when someone clicks the button:

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ]
  });
});

app.action('button_click', ({ body, ack, say }) => {
  // Acknowledge the action
  ack();
  say(`<@${body.user.id}> clicked the button`);
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
```

You can see that we used the `action_id` to add a listener for our button action. If you restart your app and click the button, you'll see a new message from your app that says you clicked the button.

---

### Next steps
You just built your first Bolt app! 🎉

Now that you have a basic app up and running, you can start exploring the parts of Bolt that will make your app stand out. Here are some ideas about where to look next:

* Read through the [Basic concepts](https://slack.dev/bolt#basic) to learn about the different methods and features your Bolt app has access to.

* Explore the different events your bot can listen to with the [`events()` method](https://slack.dev/bolt#event-listening). All of the events are listed [on the API site](https://api.slack.com/events).

* Bolt allows you to [call Web API methods](https://slack.dev/bolt#web-api) with the client attached to your app. There are [over 130 methods](https://api.slack.com/methods) on our API site.

* Learn more about the different token types [on our API site](https://api.slack.com/docs/token-types). Your app may need different tokens depending on the actions you want it to perform.
