# Bolt for JavaScript Socket Mode Test App

This is a quick example app to test [Socket Mode](https://api.slack.com/socket-mode) with Bolt for JavaScript.

If using OAuth, Slack requires a public URL where it can send requests. In this guide, we'll be using [`ngrok`](https://ngrok.com/download). Checkout [this guide](https://api.slack.com/tutorials/tunneling-with-ngrok) for setting it up. OAuth installation is only needed for public distribution. For internal apps, we recommend installing via your app configuration. 

Before we get started, make sure you have a development workspace where you have permissions to install apps. If you don’t have one setup, go ahead and [create one](https://slack.com/create). You also need to [create a new app](https://api.slack.com/apps?new_app=1) if you haven’t already. You will need to enable Socket Mode and generate an App Level Token. 

## Install Dependencies

```
npm install
```

## Install app to workspace

In your [app configuration](https://api.slack.com/apps), go to **OAuth & Permissions** and add the `channels:read`, `app_mentions:read`, `commands`, and `chat:write` permissions. Click **Install App** to install the app to your workspace and generate a bot token.

Next, navigate to the **Socket Mode** section and toggle the **Enable Socket Mode** button to start receiving events over a WebSocket connection.

Next, click on **Basic Information** and generate a `App Level Token` with the `connections:write` scope.

Then navigate to **App Home**. Under **Show tabs**, toggle the **Home tab** option.

Lastly, in **Events Subscription**, click **Subscribe to bot events** and add `app_home_opened`, `app_mentioned`, and `message.channels`.

## Setup Environment Variables

This app requires you setup a few environment variables. You can find these values in your [app configuration](https://api.slack.com/apps). 

```
// can get this from OAuth & Permission page in app configuration
export BOT_TOKEN=YOUR_SLACK_BOT_TOKEN
// can generate the app level token from basic information page in app configuration
export APP_TOKEN=YOUR_SLACK_APP_TOKEN 

// if using OAuth, also export the following
export CLIENT_ID=YOUR_SLACK_CLIENT_ID
export CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
```

## Run the App

Start the app with the following command:

```
npm start
```

### Running with OAuth

Only implement OAuth if you plan to distribute your application across multiple workspaces. Uncomment out the OAuth specific comments in the code. If you are on dev instance, you will have to uncomment out those options as well. 

Start `ngrok` so we can access the app on an external network and create a redirect URL for OAuth. 

```
ngrok http 3000
```

This output should include a forwarding address for `http` and `https` (we'll use the `https` one). It should look something like the following:

```
Forwarding   https://3cb89939.ngrok.io -> http://localhost:3000
```

Then navigate to **OAuth & Permissions** in your app configuration and click **Add a Redirect URL**. The redirect URL should be set to your `ngrok` forwarding address with the `slack/oauth_redirect` path appended. ex:

```
https://3cb89939.ngrok.io/slack/oauth_redirect
```
