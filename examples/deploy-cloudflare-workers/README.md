# Deploying to Cloudflare Workers ⚡️ Bolt for JavaScript

> Slack app example for using the CloudflareWorkerReceiver of Bolt for JavaScript

## Overview

This is an example app that updates the [Getting Started ⚡️ Bolt for JavaScript app][bolt-app] to use the CloudflareWorkerReceiver and be deployed to [Cloudflare Workers][cloudflare-workers] using [Wrangler][wrangler].
You can learn how to build this example app by following Cloudflare's [CLI guide][cloudflare-getting-started] for Workers.

Before you begin, you may want to follow our [Getting Started guide][bolt-guide] to learn how to build your first Slack app using the [Bolt for JavaScript framework][bolt-website].

## Getting started

1. [Bootstrap a Worker project](#1-bootstrap-a-worker-project)
1. [Set up local project](#2-set-up-local-project)
1. [Create a Slack app](#3-create-a-slack-app)
1. [Deploy to Cloudflare Workers](#4-deploy-to-cloudflare-workers)
1. [Update Slack app settings](#5-update-slack-app-settings)
1. [Test your Slack app](#6-test-your-slack-app)
1. [Develop on local machine](#7-develop-on-local-machine)

## 1. Bootstrap a Worker project

Follow Cloudflare's C3 bootstrap flow to create a new Worker project:

```zsh
npm create cloudflare@latest -- my-first-worker
```

For setup, select the following options:

1. For `What would you like to start with?`, choose `Hello World example`
1. For `Which template would you like to use?`, choose `Worker only`
1. For `Which language do you want to use?`, choose `TypeScript`
1. For `Do you want to use git for version control?`, choose `Yes`
1. For `Do you want to deploy your application?`, choose `No`

Move into the new project folder:

```zsh
cd my-first-worker
```

## 2. Set up local project

You can install the app's local development dependencies with the following command:

```zsh
npm install
```

Set your local secrets in `.dev.vars` so Wrangler can load them during development:

```zsh
SLACK_SIGNING_SECRET=<your-signing-secret>
SLACK_BOT_TOKEN=<your-xoxb-bot-token>
```

Cloudflare also supports secrets for deployed Workers. If you prefer to manage them that way, use `wrangler secret put` for both values before you deploy.

## 3. Create a Slack app

### Create an app on api.slack.com

1. Go to https://api.slack.com/apps
1. Select **Create New App**
   * Name your app, _don't worry you can change it later!_
1. Select **OAuth & Permissions**
   1. Scroll down to **Bot Token Scopes**
   1. Add the following bot scopes:
      1. Add the scope `app_mentions:read`
      1. Add the scope `channels:history`
      1. Add the scope `chat:write`
      1. Add the scope `groups:history`
      1. Add the scope `im:history`
      1. Add the scope `mpim:history`
   1. Select **Install App to Workspace** at the top of the page

## 4. Deploy to Cloudflare Workers

Run the following command to deploy to Cloudflare Workers:

```zsh
npm run deploy
# ...
# deployed to https://<your-worker-name>.<your-subdomain>.workers.dev
```

_Please note the endpoint `https://<your-worker-name>.<your-subdomain>.workers.dev/slack/events` because we'll use it in the next section._

## 5. Update Slack app settings

Now that your Slack app is deployed, you can register your Cloudflare Workers endpoint with the Slack API:

1. Go to https://api.slack.com/apps
1. Select your app
1. Select **Event Subscriptions**
   1. Enable **Events**
   1. Set the **Request URL** to `https://<your-worker-name>.<your-subdomain>.workers.dev/slack/events`
   1. Scroll down to **Subscribe to Bot Events**
   1. Add the following bot events:
      - `app_mention`
      - `message.channels`
      - `message.groups`
      - `message.im`
      - `message.mpim`
   1. Select **Save Changes**
1. Select **Interactivity & Shortcuts**
   1. Enable **Interactivity**
   1. Set the **Request URL** to `https://<your-worker-name>.<your-subdomain>.workers.dev/slack/events`
   1. Select **Save Changes**

## 6. Test your Slack app

You can test your app by opening a Slack workspace and saying "hello" (lower-case):

> 💬 hello
>
> 🤖 Hey there @Jane!

_Remember, your app must be in the channel or DM where you say hello._

## 7. Develop on local machine

Open a terminal session to listen for incoming requests:

```zsh
npm run dev
```

If you want a public URL while developing locally, use a tunnel or deploy the Worker and point Slack at the deployed `workers.dev` URL.

Follow the steps to [test your app](#6-test-your-slack-app).

[bolt-app]: https://github.com/slackapi/bolt-js-getting-started-app
[bolt-guide]: https://docs.slack.dev/bolt-js/getting-started/
[bolt-website]: https://docs.slack.dev/bolt-js/
[cloudflare-getting-started]: https://developers.cloudflare.com/workers/get-started/guide/
[cloudflare-workers]: https://developers.cloudflare.com/workers/
[wrangler]: https://developers.cloudflare.com/workers/wrangler/
