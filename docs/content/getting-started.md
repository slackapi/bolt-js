---
title: Quickstart with Bolt for JavaScript
sidebar_label: Quickstart
---

This quickstart guide aims to help you get a Slack app using Bolt for JavaScript up and running as soon as possible!

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

When complete, you'll have a local environment configured with a customized [app](https://github.com/slack-samples/bolt-js-getting-started-app) running that responds to a simple greeting.

:::tip[Reference for readers]

In search of the complete guide to building an app from scratch? Check out the [building an app](/building-an-app) guide.

:::

#### Prerequisites

A few tools are needed for the following steps. We recommend using the [**Slack CLI**](https://tools.slack.dev/slack-cli/) for the smoothest experience, but other options remain available.

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

Install the latest version of the Slack CLI to get started:

- [Slack CLI for macOS & Linux](https://tools.slack.dev/slack-cli/guides/installing-the-slack-cli-for-mac-and-linux)
- [Slack CLI for Windows](https://tools.slack.dev/slack-cli/guides/installing-the-slack-cli-for-windows)

Then confirm a successful installation with the following command:

```sh
$ slack version
```

An authenticated login is also required if this hasn't been done before:

```sh
$ slack login
```

</TabItem>
<TabItem value="terminal" label="Terminal">

Tooling for the terminal can also be used to follow along:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download)

Once installed, make sure recent versions are being used:

```sh
$ git --version
$ node --version
```

</TabItem>
</Tabs>

:::info[A place to belong]

A workspace where development can happen is also needed.

We recommend using [developer sandboxes](https://docs.slack.dev/tools/developer-sandboxes) to avoid disruptions where real work gets done.

:::

## Creating a project {#creating-a-project}

With the toolchain configured, it's time to set up a new Bolt project. This contains the code that handles logic for your app.

If you don’t already have a project, let’s create a new one!

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

A starter template can be used to start with project scaffolding:

```sh
$ slack create first-bolt-app --template slack-samples/bolt-js-getting-started-app
$ cd first-bolt-app
```

After a project is created you'll have a `package.json` file for app dependencies and a `.slack` directory for Slack CLI configuration.

A few other files exist too, but we'll visit these later.

</TabItem>
<TabItem value="terminal" label="Terminal">

A starter template can be cloned to start with project scaffolding:

```sh
$ git clone https://github.com/slack-samples/bolt-js-getting-started-app first-bolt-app
$ cd first-bolt-app
$ npm install
```

Outlines of a project are taking shape, so we can move on to running the app!

</TabItem>
</Tabs>

## Running the app {#running-the-app}

Before you can start developing with Bolt, you will want a running Slack app.

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

The getting started app template contains a `manifest.json` file with details about an app that we will use to get started. Use the following command and select "Create a new app" to install the app to the team of choice:

```sh
$ slack run
...
[INFO]  bolt-app ⚡️ Bolt app is running!
```

With the app running, you can test it out with the following steps in Slack:

1. Open a direct message with your app or invite the bot `@first-bolt-app (local)` to a public channel.
2. Send "hello" to the current conversation and wait for a response.
3. Click the attached button labelled "Click Me" to post another reply.

After confirming the app responds, celebrate, then interrupt the process by pressing `CTRL+C` in the terminal to stop your app from running.

</TabItem>
<TabItem value="terminal" label="Browser">

Navigate to your list of apps and [create a new Slack app](https://api.slack.com/apps/new) using the "from a manifest" option:

1. Select the workspace to develop your app in.
2. Copy and paste the `manifest.json` file contents to create your app.
3. Confirm the app features and click "Create".

You'll then land on your app's **Basic Information** page, which is an overview of your app and which contains important credentials:

![Basic Information page](/img/basic-information-page.png "Basic Information page")

To listen for events happening in Slack (such as a new posted message) without opening a port or exposing an endpoint, we will use [Socket Mode](/concepts/socket-mode). This connection requires a specific app token:

1. On the **Basic Information** page, scroll to the **App-Level Tokens** section and click **Generate Token and Scopes**.
2. Name the token "Development" or something similar and add the `connections:write` scope, then click **Generate**.
3. Save the generated `xapp` token as an environment variable within your project:

```sh
$ export SLACK_APP_TOKEN=xapp-1-A0123456789-example
```

The above command works on Linux and macOS but [similar commands are available on Windows](https://superuser.com/questions/212150/how-to-set-env-variable-in-windows-cmd-line/212153#212153).

:::warning[Keep it secret. Keep it safe]

Treat your tokens like a password and [keep it safe](https://docs.slack.dev/authentication/best-practices-for-security). Your app uses these to retrieve and send information to Slack.

:::

A bot token is also needed to interact with the Web API methods as your app's bot user. We can gather this as follows:

1. Navigate to the **OAuth & Permissions** on the left sidebar and install your app to your workspace to generate a token.
2. After authorizing the installation, you'll return to the **OAuth & Permissions** page and find a **Bot User OAuth Token**:

![OAuth Tokens](/img/bot-token.png "Bot OAuth Token")

3. Copy the bot token beginning with `xoxb` from the **OAuth & Permissions page** and then store it in a new environment variable:

```sh
$ export SLACK_BOT_TOKEN=xoxb-example
```

After the app has been created, it is time to run it:

```sh
$ npm run start
...
[INFO]  bolt-app ⚡️ Bolt app is running!
```

With the app running, you can test it out with the following steps in Slack:

1. Open a direct message with your app or invite the bot `@BoltApp` to a public channel.
2. Send "hello" to the current conversation and wait for a response.
3. Click the attached button labelled "Click Me" to post another reply.

After confirming the app responds, celebrate, then interrupt the process by pressing `CTRL+C` in the terminal to stop your app from running.

</TabItem>
</Tabs>

## Updating the app

At this point, you've successfully run the getting started Bolt for JavaScript [app](https://github.com/slack-samples/bolt-js-getting-started-app)!

The defaults included leave opportunities abound, so to personalize this app let's now edit the code to respond with a kind farewell.

#### Responding to a farewell

Chat is a common thing apps do and responding to various types of messages can make conversations more interesting.

Using an editor of choice, open the `app.js` file and add the following message listener after the "hello" handler:

```js
app.message('goodbye', async ({ say }) => {
  const responses = ['Adios', 'Au revoir', 'Farewell'];
  const parting = responses[Math.floor(Math.random() * responses.length)];
  await say(`${parting}!`);
});
```

Once the file is updated, save the changes and then we'll make sure those changes are being used.

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

Run the following command and select the app created earlier to start, or restart, your app with the latest changes:

```sh
$ slack run
...
[INFO]  bolt-app ⚡️ Bolt app is running!
```

After finding the above output appears, open Slack to perform these steps:

1. Return to the direct message or public channel with your bot.
2. Send "goodbye" to the conversation.
3. Receive a parting response from before and repeat "goodbye" to find another one.

Your app can be stopped again by pressing `CTRL+C` in the terminal to end these chats.

</TabItem>
<TabItem value="terminal" label="Terminal">

Run the following command to start, or restart, your app with the latest changes:

```sh
$ npm run start
...
[INFO]  bolt-app ⚡️ Bolt app is running!
```

After finding the above output appears, open Slack to perform these steps:

1. Return to the direct message or public channel with your bot.
2. Send "goodbye" to the conversation.
3. Receive a parting response from before and repeat "goodbye" to find another one.

Your app can be stopped again by pressing `CTRL+C` in the terminal to end these chats.

</TabItem>
</Tabs>

#### Customizing app settings

The created app will have some placeholder values and a small set of [scopes](https://docs.slack.dev/reference/scopes) to start, but we recommend exploring the customizations possible on app settings.

<Tabs groupId="cli-or-terminal">
<TabItem value="cli" label="Slack CLI">

Open app settings for your app with the following command:

```sh
$ slack app settings
```

This will open the following page in a web browser:

![Basic Information page](/img/basic-information-page.png "Basic Information page")

</TabItem>
<TabItem value="terminal" label="Browser">

Browse to https://api.slack.com/apps and select your app "Getting Started Bolt App" from the list.

This will open the following page:

![Basic Information page](/img/basic-information-page.png "Basic Information page")

</TabItem>
</Tabs>

On these pages you're free to make changes such as updating your app icon, configuring app features, and perhaps even distributing your app!

## Next steps {#next-steps}

Congrats once more on getting up and running with this quick start.

:::info[Dive deeper]

Follow along with the steps that went into making this app on the [building an app](/building-an-app) guide for an educational overview.

:::

You can now continue customizing your app with various features to make it right for whatever job's at hand. Here are some ideas about what to explore next:

- Explore the different events your bot can listen to with the [`event`](/concepts/event-listening) method. All of the [events](https://docs.slack.dev/reference/events) are listed on the API docs site.
- Bolt allows you to call [Web API](/concepts/web-api) methods with the client attached to your app. There are [over 200 methods](https://docs.slack.dev/reference/methods) on the API docs site.
- Learn more about the different [token types](https://docs.slack.dev/authentication/tokens) and [authentication setups](/concepts/authenticating-oauth). Your app might need different tokens depending on the actions you want to perform or for installations to multiple workspaces.
- Receive events using HTTP for various deployment methods, such as deploying to [Heroku](/deployments/heroku) or [AWS Lambda](/deployments/aws-lambda).
- Read on [app design](https://docs.slack.dev/surfaces/app-design) and compose fancy messages with blocks using [Block Kit Builder](https://app.slack.com/block-kit-builder) to prototype messages.
