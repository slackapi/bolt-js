# Bolt for JavaScript: Custom Receiver Example App

This is a quick example app to demonstrate how to implement a custom receiver to integrate `App` with 3rd party web framework, which allows developers to directly access Node.js http package interface.

## Install Dependencies

To link to latest source code, you can run the following script:

```
./link.sh
```

## Setup Environment Variables

This app requires you setup a few environment variables. You can find these values in your [app configuration](https://api.slack.com/apps).

```bash
export SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
export SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
export SLACK_SIGNING_SECRET=YOUR_SLACK_SIGNING_SECRET
```

## Run the App

Start the app with the following command:

```
npm run koa
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

Start the OAuth flow from https://{your own subdomain}.ngrok.io/slack/install