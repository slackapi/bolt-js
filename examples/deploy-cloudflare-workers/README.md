# Deploying to Cloudflare Workers ⚡️ Bolt for JavaScript

> Slack app example for using the CloudflareWorkerReceiver of Bolt for JavaScript

## Overview

This is an example app that updates the [Getting Started ⚡️ Bolt for JavaScript app][bolt-app] to use the CloudflareWorkerReceiver and be deployed to [Cloudflare Workers][cloudflare-workers] using [Wrangler][wrangler].
You can learn how to build this example app by following Cloudflare's [CLI guide][cloudflare-getting-started] for Workers.

Before you begin, you may want to follow our [Getting Started guide][bolt-guide] to learn how to build your first Slack app using the [Bolt for JavaScript framework][bolt-website].

## Getting started

1. [Bootstrap a Worker project](#1-bootstrap-a-worker-project)
2. [Set up local project](#2-set-up-local-project)
3. [Create a Slack app](#3-create-a-slack-app)
4. [Develop on local machine](#4-develop-on-local-machine)
5. [Update Slack app settings](#5-update-slack-app-settings)
6. [Test your Slack app](#6-test-your-slack-app)
7. [Deploy to Cloudflare Workers](#7-deploy-to-cloudflare-workers)

## 1. Bootstrap a Worker project

Follow Cloudflare's C3 bootstrap flow to create a new Worker project:

```zsh
npm create cloudflare@latest -- my-first-worker
```

For setup, select the following options:

1. For `What would you like to start with?`, choose `Hello World example`
2. For `Which template would you like to use?`, choose `Worker only`
3. For `Which language do you want to use?`, choose `TypeScript`
4. For `Do you want to use git for version control?`, choose `Yes`
5. For `Do you want to deploy your application?`, choose `No`

Move into the new project folder:

```zsh
cd my-first-worker
```

## 2. Set up local project

You can install the app's local development dependencies with the following command:

```zsh
npm install
```

Set your local secrets in `.dev.vars` so Wrangler can load them during development. Cloudflare recommends this file for local-only values:

```zsh
SLACK_SIGNING_SECRET=<your-signing-secret>
SLACK_BOT_TOKEN=<your-xoxb-bot-token>
```

## 3. Create a Slack app

### Create an app on api.slack.com

1. Go to https://api.slack.com/apps
2. Select **Create New App**
   * Name your app, _don't worry you can change it later!_
3. Select **OAuth & Permissions**
   1. Scroll down to **Bot Token Scopes**
   2. Add the following bot scopes:
      1. Add the scope `app_mentions:read`
      2. Add the scope `channels:history`
      3. Add the scope `chat:write`
      4. Add the scope `groups:history`
      5. Add the scope `im:history`
      6. Add the scope `mpim:history`
   3. Select **Install App to Workspace** at the top of the page

## 4. Develop on local machine

1. Open a terminal session to start Wrangler dev:

   ```zsh
   npm run dev
   ```

   Wrangler serves the Worker locally at `http://localhost:8787`.

2. Open a second terminal session and expose that local server with Cloudflare Tunnel:

   ```zsh
   npx cloudflared tunnel --url http://localhost:8787
   ```

   Cloudflared prints a public `https://<random>.trycloudflare.com` URL. Keep this terminal running while you test.

3. Keep your local secrets in `.dev.vars` as described above.

4. Follow [Update Slack app settings](#5-update-slack-app-settings) to point Slack at the tunnel URL from Cloudflared.

## 5. Update Slack app settings

While developing locally, point Slack at your Cloudflare Tunnel URL. After you deploy, come back to this section and replace it with the `workers.dev` URL from the final section.

1. Go to https://api.slack.com/apps
2. Select your app
3. Select **Event Subscriptions**
   1. Enable **Events**
   2. Set the **Request URL** to `https://<your-cloudflared-url>/slack/events`
   3. Scroll down to **Subscribe to Bot Events**
   4. Add the following bot events:
      - `app_mention`
      - `message.channels`
      - `message.groups`
      - `message.im`
      - `message.mpim`
   5. Select **Save Changes**
4. Select **Interactivity & Shortcuts**
   1. Enable **Interactivity**
   2. Set the **Request URL** to `https://<your-cloudflared-url>/slack/events`
   3. Select **Save Changes**

## 6. Test your Slack app

You can test your app by opening a Slack workspace and saying "hello" (lower-case):

> 💬 hello
>
> 🤖 Hey there @Jane!

_Remember, your app must be in the channel or DM where you say hello._

## 7. Deploy to Cloudflare Workers

Before you deploy, add both secrets with `npx wrangler secret put`:

```zsh
npx wrangler secret put SLACK_SIGNING_SECRET
npx wrangler secret put SLACK_BOT_TOKEN
```

Then run the following command to deploy to Cloudflare Workers:

```zsh
npm run deploy
# ...
# deployed to https://<your-worker-name>.<your-subdomain>.workers.dev
```

After deployment, repeat [Update Slack app settings](#5-update-slack-app-settings) and replace the tunnel URL with `https://<your-worker-name>.<your-subdomain>.workers.dev/slack/events`.

[bolt-app]: https://github.com/slackapi/bolt-js-getting-started-app
[bolt-guide]: https://docs.slack.dev/bolt-js/getting-started/
[bolt-website]: https://docs.slack.dev/bolt-js/
[cloudflare-getting-started]: https://developers.cloudflare.com/workers/get-started/guide/
[cloudflare-workers]: https://developers.cloudflare.com/workers/
[wrangler]: https://developers.cloudflare.com/workers/wrangler/
