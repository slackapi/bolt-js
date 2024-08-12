---
title: Authenticating with OAuth
lang: en
slug: /concepts/authenticating-oauth
---

To prepare your Slack app for distribution, you will need to enable Bolt OAuth and store installation information securely. Bolt supports OAuth and will handle the rest of the work; this includes setting up OAuth routes, state verification, and passing your app an installation object which you must store. 

To enable OAuth, you must provide:
* `clientId`, `clientSecret`, `stateSecret` and `scopes` _(required)_
* An `installationStore` option with handlers that store and fetch installations to your database *(optional, strongly recommended in production)*

---

## Development and Testing

We've provided a default implementation of the `installationStore`  `FileInstallationStore` which you can use during app development and testing.

```javascript
const { App } = require('@slack/bolt');
const { FileInstallationStore } = require('@slack/oauth');
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['channels:history', 'chat:write', 'commands'],
  installationStore: new FileInstallationStore(),
});
```
:::warning 

This is **_not_** recommended for use in production - you should implement your own production store. Please see the example code to the right and [our other examples](https://github.com/slackapi/bolt-js/tree/main/examples/oauth).

:::

---

## Installing your App

* **Initiating an installation**: Bolt for JavaScript provides an **Install Path** `/slack/install` out-of-the-box. This endpoint returns a simple page with an `Add to Slack` button which initiates a direct install of your app (with a valid `state` parameter). An app hosted at _www.example.com_ would serve the install page at _www.example.com/slack/install_. 

:::tip

You can skip rendering the provided default webpage and navigate users directly to Slack authorize URL by setting`installerOptions.directInstall: true` in the `App` constructor ([example](https://github.com/slackapi/bolt-js/blob/5b4d9ceb65e6bf5cf29dfa58268ea248e5466bfb/examples/oauth/app.js#L58-L64)).

:::

* **Add to Slack**: The `Add to Slack` button initiates the OAuth process with Slack. After users have clicked Allow to grant your app permissions, Slack will call your app's **Redirect URI** (provided out-of-the-box), and prompt users to **Open Slack**. See the **Redirect URI** section below for customization options.

* **Open Slack**: After users **Open Slack**, and here after as your app processes events from Slack, your provided `installationStore`'s `fetchInstallation` and `storeInstallation` handlers will execute. See the **Installation Object** section below for more detail on arguments passed to those handlers.  

* If you need additional authorizations (user tokens) from users inside a team when your app is already installed, or have a reason to dynamically generate an install URL, manually instantiate an `ExpressReceiver`, assign the instance to a variable named `receiver`, and then call `receiver.installer.generateInstallUrl()`. Read more about `generateInstallUrl()` in the [OAuth docs](https://slack.dev/node-slack-sdk/oauth#generating-an-installation-url).

:::info 

Bolt for JavaScript does not support OAuth for [custom receivers](/concepts/receiver). If you're implementing a custom receiver, you can use our [Slack OAuth library](https://slack.dev/node-slack-sdk/oauth#slack-oauth), which is what Bolt for JavaScript uses under the hood.

:::

---
## Redirect URI
Bolt for JavaScript provides a **Redirect URI Path** `/slack/oauth_redirect`. Slack uses the Redirect URI to redirect users after they complete an app's installation flow. 

You will need to add the full **Redirect URI** including your app domain in your Slack app configuration settings under **OAuth and Permissions**, e.g. `https://example.com/slack/oauth_redirect`. 

To supply your own custom **Redirect URI**, you can set `redirectUri` in the App options and `installerOptions.redirectUriPath`. You must supply both, and the path must be consistent with the full URI.

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['chat:write'],
  redirectUri: 'https://example.com/slack/redirect', // here
  installerOptions: {
    redirectUriPath: '/slack/redirect', // and here!
  },
});
```

---

## Installation object
Bolt will pass your `installationStore`'s `storeInstallation` handler an `installation`. This can be a source of confusion for developers who aren't sure what shape of object to expect. The `installation` object should resemble:

```javascript
{
  team: { id: 'T012345678', name: 'example-team-name' },
  enterprise: undefined,
  user: { token: undefined, scopes: undefined, id: 'U01234567' },
  tokenType: 'bot',
  isEnterpriseInstall: false,
  appId: 'A01234567',
  authVersion: 'v2',
  bot: {
    scopes: [
      'chat:write',
    ],
    token: 'xoxb-244493-28*********-********************',
    userId: 'U012345678',
    id: 'B01234567'
  }
}
```
Bolt will pass your `fetchInstallation` and `deleteInstallation` handlers an `installQuery` object:

```javascript
{
  userId: 'U012345678',
  isEnterpriseInstall: false,
  teamId: 'T012345678',
  enterpriseId: undefined,
  conversationId: 'D02345678'
}
```

---
## Org-wide installation
To add support for [org-wide installations](https://api.slack.com/enterprise/apps), you will need Bolt for JavaScript version `3.0.0` or later. Make sure you have enabled org-wide installation in your app configuration settings under **Org Level Apps**.

Installing an [org-wide](https://api.slack.com/enterprise/apps) app from admin pages requires additional configuration to work with Bolt. In that scenario, the recommended `state` parameter is not supplied. Bolt will try to verify `state` and stop the installation from progressing. 

You may disable state verification in Bolt by setting the `stateVerification` option to false. See the example setup below:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['chat:write'],
  installerOptions: {
    stateVerification: false,
  },
});
```

To learn more about the OAuth installation flow with Slack, [read the API documentation](https://api.slack.com/authentication/oauth-v2).

```javascript
const database = {
  async get(key) {},
  async delete(key) {},
  async set(key, value) {}
};

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-secret',
  scopes: ['chat:write', 'commands'],
  installationStore: {
    storeInstallation: async (installation) => {
      // Bolt will pass your handler an installation object
      // Change the lines below so they save to your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // handle storing org-wide app installation
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await database.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // Bolt will pass your handler an installQuery object
      // Change the lines below so they fetch from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // handle org wide app installation lookup
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await database.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // Bolt will pass your handler  an installQuery object
      // Change the lines below so they delete from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await database.delete(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await database.delete(installQuery.teamId);
      }
      throw new Error('Failed to delete installation');
    },
  },
});
```

<details>
<summary>
Customizing OAuth defaults
</summary>

We provide several options for customizing default OAuth using the `installerOptions` object, which can be passed in during the initialization of `App`. You can override the following:

- `authVersion`: Used to toggle between new Slack Apps and Classic Slack Apps
- `metadata`: Used to pass around session related information
- `installPath`: Override default path for "Add to Slack" button
- `redirectUriPath`: This relative path must match the `redirectUri` provided in the App options 
- `callbackOptions`: Provide custom success and failure pages at the end of the OAuth flow
- `stateStore`: Provide a custom state store instead of using the built in `ClearStateStore`
- `userScopes`: Array of user scopes needed when the user installs the app, similar to `scopes` attribute at the parent level.

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ['channels:read', 'groups:read', 'channels:manage', 'chat:write', 'incoming-webhook'],
  installerOptions: {
      authVersion: 'v1', // default  is 'v2', 'v1' is used for classic slack apps
      metadata: 'some session data',
      installPath: '/slack/installApp',
      redirectUriPath: '/slack/redirect',
      userScopes: ['chat:write'],
      callbackOptions: {
        success: (installation, installOptions, req, res) => {
          // Do custom success logic here
          res.send('successful!');
        }, 
        failure: (error, installOptions , req, res) => {
          // Do custom failure logic here
          res.send('failure');
        }
      },
      stateStore: {
        // Do not need to provide a `stateSecret` when passing in a stateStore
        // generateStateParam's first argument is the entire InstallUrlOptions object which was passed into generateInstallUrl method
        // the second argument is a date object
        // the method is expected to return a string representing the state
        generateStateParam: async (installUrlOptions, date) => {
          // generate a random string to use as state in the URL
          const randomState = randomStringGenerator();
          // save installOptions to cache/db
          await myDB.set(randomState, installUrlOptions);
          // return a state string that references saved options in DB
          return randomState;
        },
        // verifyStateParam's first argument is a date object and the second argument is a string representing the state
        // verifyStateParam is expected to return an object representing installUrlOptions
        verifyStateParam:  async (date, state) => {
          // fetch saved installOptions from DB using state reference
          const installUrlOptions = await myDB.get(randomState);
          return installUrlOptions;
        }
      },
  }
});
```
</details>