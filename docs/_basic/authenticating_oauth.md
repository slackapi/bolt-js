---
title: Authenticating with OAuth
lang: en
slug: authenticating-oauth
order: 15
---

<div class="section-content">
To make your Slack app ready for distribution, you will need to implement OAuth and store installation information (i.e. access tokens) securely. Bolt supports OAuth and will handle most of the work for you by setting up OAuth routes and verifying state. 

You will need to provide your:
* `clientId`, `clientSecret`, `stateSecret` and `scopes` (required)
* An `installationStore` option with `storeInstallation` and `fetchInstallation` handlers defined for storing installation data to a database *(optional, but highly recommended for production)*

---

##### Installing your App
Bolt for JavaScript provides an **Install Path** `/slack/install` out-of-the-box. This endpoint returns a simple `Add to Slack` button where users can initiate direct installs of your app with a valid `state` parameter. For example, if your app was hosted at `www.example.com`, you would be able to install your app at `www.example.com/slack/install`. If you would like to skip rendering the simple webpage and directly navigate end-users to Slack authorize URL, your app can set `installerOptions.directInstall: true` in the `App` constructor. See example code below:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['chat:write'],
  installerOptions: {
    directInstall: true,
  },
});
```

Once you click on the `Add to Slack` button, this will initiate the OAuth process. Users will see a green `Allow` button and dialogue of your app asking for permissions. Once you click on the `Allow` button, Slack will call your app's redirect URI. This will bring you to the `slack/oauth_redirect` endpoint and alert you in your browser to "Open Slack". Only after you **Open Slack** will the `fetchInstallation` and `storeInstallation` handlers execute. 

Bolt provides a redirect URI out-of-the-box. See the following section, Redirect URI for more details.  

Additionally, you can expect the `installation` object to look like the following:

```json
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

Similarly, the installQuery object will look like the following:

```json
{
  userId: 'U012345678',
  isEnterpriseInstall: false,
  teamId: 'T012345678',
  enterpriseId: undefined,
  conversationId: 'D02345678'
}
```

If you need additional authorizations (user tokens) from users inside a team when your app is already installed, or have a reason to dynamically generate an install URL, manually instantiate an `ExpressReceiver`, assign the instance to a variable named `receiver`, and then call `receiver.installer.generateInstallUrl()`. Read more about `generateInstallUrl()` in the [OAuth docs](https://slack.dev/node-slack-sdk/oauth#generating-an-installation-url).


💡 *Bolt for JavaScript does not support OAuth for [custom receivers](#receiver). If you're implementing a custom receiver, you can use our [Slack OAuth library](https://slack.dev/node-slack-sdk/oauth#slack-oauth), which is what Bolt for JavaScript uses under the hood.*


---
##### Redirect URI
Bolt for JavaScript provides a **Redirect URI Path** `/slack/oauth_redirect` out-of-the-box. Slack uses this to redirect users after they complete your app's installation flow. 

💡 You will need to add the full **Redirect URI** including your app domain in your app configuration settings under **OAuth and Permissions**, e.g. `https://example.com/slack/oauth_redirect`. 

If you'd like to supply your own custom **Redirect URI**, you can do this by setting `redirectUri` in the App options and `installerOptions.redirectUriPath`. You must supply both, and the path must be consistent with the full URI.

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
##### Org-wide installation
To add support for [org-wide installations](https://api.slack.com/enterprise/apps), you will need Bolt for JavaScript version `3.0.0` or newer. Make sure you have enabled org-wide installations in your app configuration settings under **Org Level Apps**.

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

</div>

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-secret',
  scopes: ['chat:write', 'commands'],
  installationStore: {
    storeInstallation: async (installation) => {
      // change the lines below so they save to your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // support for org-wide app installation
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await database.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // change the lines below so they fetch from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await database.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // change the lines below so they delete from your database
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

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">Customizing OAuth defaults</h4>
</summary>

<div class="secondary-content" markdown="0">
We provide several options for customizing default OAuth using the `installerOptions` object, which can be passed in during the initialization of `App`. You can override the following:

- `authVersion`: Used to toggle between new Slack Apps and Classic Slack Apps
- `metadata`: Used to pass around session related information
- `installPath`: Override default path for "Add to Slack" button
- `redirectUriPath`: This relative path must match the `redirectUri` provided in the App options 
- `callbackOptions`: Provide custom success and failure pages at the end of the OAuth flow
- `stateStore`: Provide a custom state store instead of using the built in `ClearStateStore`
- `userScopes`: Array of user scopes needed when the user installs the app, similar to `scopes` attribute at the parent level.

</div>

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
