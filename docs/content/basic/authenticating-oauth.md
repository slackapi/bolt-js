---
title: Authenticating with OAuth
lang: en
slug: /concepts/authenticating-oauth
---

OAuth allows installation of your app to any workspace and is an important step in distributing your app. This is because each app installation issues unique [access tokens with related installation information](#the-installation-object) that can be retrieved for incoming events and used to make scoped API requests.

All of the additional underlying details around authentications can be found
within [the Slack API documentation][oauth-v2]!

## Configuring the application

To set your Slack app up for distribution, you will need to enable Bolt OAuth
and store installation information securely. Bolt supports OAuth by using the
[`@slack/oauth`][oauth-node] package to handle most of the work; this includes
setting up OAuth routes, verifying state, and passing your app an installation
object which you must store.

### App options

The following `App` options are required for OAuth installations:

- `clientId`: `string`. An application credential found on the **Basic
  Information** page of your [app settings][app-settings].
- `clientSecret`: `string`. A secret value also found on the **Basic
  Information** page of your [app settings][app-settings].
- `stateSecret`: `string`. A secret value used to
  [generate and verify state][verification] parameters of authorization
  requests.
- `scopes`: `string[]`. Permissions requested for the `bot` user during
  installation. [Explore scopes][scopes].
- `installationStore`: [`InstallationStore`][installation-store]. Handlers that
  store, fetch, and delete installation information to and from your database.
  Optional, but strongly recommended in production.

### Example OAuth Bolt Apps

Check out the following examples in the bolt-js project for code samples:

- [Bolt OAuth app using the classic HTTP Receiver](https://github.com/slackapi/bolt-js/tree/main/examples/oauth)
- [Bolt OAuth app using the Express Receiver](https://github.com/slackapi/bolt-js/tree/main/examples/oauth-express-receiver)

#### Development and testing

Here we've provided a default implementation of the `installationStore` with
[`FileInstallationStore`][installation-store-file] which can be useful when
developing and testing your app:

```javascript
const { App } = require("@slack/bolt");
const { FileInstallationStore } = require("@slack/oauth");
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ["channels:history", "chat:write", "commands"],
  installationStore: new FileInstallationStore(),
});
```

:::warning

This is **not** recommended for use in production - you should
[implement your own installation store](#installation-store). Please continue
reading or inspect [our OAuth example apps][examples].

:::

### Installer options

We provide several options for customizing default OAuth using the
`installerOptions` object, which can be passed in during the initialization of
`App`. You can override these common options and
[find others here][install-provider-options]:

- `authVersion`: `string`. Settings for either new Slack apps (`v2`) or
  "classic" Slack apps (`v1`). Most apps use `v2` since `v1` was available for a
  Slack app model that can no longer be created. Default: `v2`.
- `directInstall`: `boolean`. Skip rendering the
  [installation page](#add-to-slack-button) at `installPath` and redirect to the
  authorization URL instead. Default: `false`.
- `installPath`: `string`. Path of the URL for starting an installation.
  Default: `/slack/install`.
- `metadata`: `string`. Static information shared between requests as install
  URL options. Optional.
- `redirectUriPath`: `string`. Path of the installation callback URL. Default:
  `/slack/oauth_redirect`.
- `stateVerification`: `boolean`. Option to customize the state verification
  logic. When set to `false`, the app does not verify the state parameter. While
  not recommended for general OAuth security, some apps might want to skip this
  for internal installations within an enterprise grid org. Default: `true`.
- `userScopes`: `string[]`. User scopes to request during installation. Default:
  `[]`.
- `callbackOptions`: [`CallbackOptions`][callback-options]. Customized
  [responses to send][callbacks] during OAuth.
  [Default callbacks][callback-options-default].
- `stateStore`: [`StateStore`][state-store]. Customized generator and validator
  for [OAuth state parameters][state]; the default `ClearStateStore` should work
  well for most scenarios. However, if you need even better security, storing
  state parameter data with a server-side database would be a good approach.
  Default: [`ClearStateStore`][state-store-clear].

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: [
    "channels:manage",
    "channels:read",
    "chat:write",
    "groups:read",
    "incoming-webhook",
  ],
  installerOptions: {
    authVersion: "v2",
    directInstall: false,
    installPath: "/slack/install",
    metadata: "",
    redirectUriPath: "/slack/oauth_redirect",
    stateVerification: "true",
    /**
     * Example user scopes to request during installation.
     */
    userScopes: ["chat:write"],
    /**
     * Example pages to navigate to on certain callbacks.
     */
    callbackOptions: {
      success: (installation, installUrlOptions, req, res) => {
        res.send("The installation succeeded!");
      },
      failure: (error, installUrlOptions, req, res) => {
        res.send("Something strange happened...");
      },
    },
    /**
     * Example validation of installation options using a random state and an
     * expiration time between requests.
     */
    stateStore: {
      generateStateParam: async (installUrlOptions, now) => {
        const state = randomStringGenerator();
        const value = { options: installUrlOptions, now: now.toJSON() };
        await database.set(state, value);
        return state;
      },
      verifyStateParam: async (now, state) => {
        const value = await database.get(state);
        const generated = new Date(value.now);
        const seconds = Math.floor(
          (now.getTime() - generated.getTime()) / 1000,
        );
        if (seconds > 600) {
          throw new Error("The state expired after 10 minutes!");
        }
        return value.options;
      },
    },
  },
});
```

<details>
  <summary>Example database object</summary>

For quick testing purposes, the following might be interesting:

```javascript
const database = {
  store: {},
  async get(key) {
    return this.store[key];
  },
  async set(key, value) {
    this.store[key] = value;
  },
};
```

</details>

---

## Completing authentication

The complete authentication handshake involves requesting scopes using a
generated installation URL and processing approved installations. Bolt handles
this with a default installation and callback route, but some configurations to
the app settings are needed and changes to these routes might be desired.

:::info

Bolt for JavaScript does not support OAuth for
[custom receivers](/concepts/receiver). If you're implementing a custom
receiver, you can instead use our [`@slack/oauth`][oauth-node] package, which is
what Bolt for JavaScript uses under the hood.

:::

### Installing your App

Bolt for JavaScript provides an **Install Path** at the `/slack/install` URL
out-of-the-box. This endpoint returns a simple static page that includes an
`Add to Slack` button that links to a generated authorization URL for your app.
This has the right scopes, a valid `state`, the works.

For example, an app hosted at _www.example.com_ will serve the install page at
_www.example.com/slack/install_ but this path can be changed with
`installerOptions.installPath`. Rendering a webpage before the authorization URL
is also optional and can be skipped using `installerOptions.directInstall`.

Inspect this [example app][direct-install] and snippet below:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // ...
  installerOptions: {
    // highlight-start
    directInstall: true,
    installPath: "/slack/installations", // www.example.com/slack/installations
    // highlight-end
  },
});
```

#### Add to Slack button

The [default][add-to-slack] `Add to Slack` button initiates the OAuth process
with Slack using a generated installation URL. If customizations are wanted to
this page, changes can be made using
[`installerOptions.renderHtmlForInstallPath`][installation-page] and the
generated installation URL:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // ...
  installerOptions: {
    // highlight-start
    renderHtmlForInstallPath: (addToSlackUrl) => {
      return `<a href="${addToSlackUrl}">Add to Slack</a>`;
    },
    // highlight-end
  },
});
```

We do recommend using the provided [button generator][oauth-v2] when formatting
links to the authorization page!

:::note

Authorization requests with changed or additional scopes require
[generating a unique authorization URL](#extra-authorizations).

:::

### Redirect URL

Bolt for JavaScript provides the **Redirect URL** path `/slack/oauth_redirect`
out-of-the-box for Slack to use when redirecting users that complete the OAuth
installation flow.

You will need to add the full **Redirect URL** including your app domain in
[app settings][settings] under **OAuth and Permissions**, e.g.
`https://example.com/slack/oauth_redirect`.

To supply a custom Redirect URL, you can set `redirectUri` in the App options
and `installerOptions.redirectUriPath`. Both must be supplied and be consistent
with the full URL if a custom Redirect URL is provided:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ["chat:write"],
  // highlight-next-line
  redirectUri: "https://example.com/slack/redirect",
  installerOptions: {
    // highlight-next-line
    redirectUriPath: "/slack/redirect",
  },
});
```

#### Custom callbacks

The page shown after OAuth is complete can be changed with
`installerOptions.callbackOptions` to display different details:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // ...
  installerOptions: {
    // highlight-start
    callbackOptions: {
      success: (installation, installOptions, req, res) => {
        res.send("The installation succeeded!");
      },
      failure: (error, installOptions, req, res) => {
        res.send("Something strange happened...");
      },
    },
    // highlight-end
  },
});
```

Full reference reveals [these additional options][callback-options] but if no
options are provided, the [`defaultCallbackSuccess`][callback-default-success]
and [`defaultCallbackFailure`][callback-default-failure] callbacks are used.

### Workspace installations

Incoming installations are received after a successful OAuth process and must be
stored for later lookup. This happens in the terms of installation objects and
an installation store.

The following outlines installations to individual workspaces with more
[information on org-wide installations](#org-wide-installation) below.

#### Installation objects

##### The `installation` object

Bolt passes an `installation` object to the `storeInstallation` method of your
`installationStore` after each installation. When installing the app to a single
workspace team, the `installation` object has the following shape:

```javascript
{
  team: { id: "T012345678", name: "example-team-name" },
  enterprise: undefined,
  user: { token: undefined, scopes: undefined, id: "U012345678" },
  tokenType: "bot",
  isEnterpriseInstall: false,
  appId: "A01234567",
  authVersion: "v2",
  bot: {
    scopes: [
      "chat:write",
    ],
    token: "xoxb-244493-28*********-********************",
    userId: "U001111000",
    id: "B01234567"
  }
}
```

##### The `installQuery` object

Bolt also passes an `installQuery` object to your `fetchInstallation` and
`deleteInstallation` handlers:

```javascript
{
  userId: "U012345678",
  isEnterpriseInstall: false,
  teamId: "T012345678",
  enterpriseId: undefined,
  conversationId: "D02345678"
}
```

#### Installation store

The `installation` object received above must be stored after installations for
retrieval during lookup or removal during deletion using values from the
`installQuery` object.

An [installation store][store] implements the handlers `storeInstallation`,
`fetchInstallation`, and `deleteInstallation` for each part of this process. The
following implements a simple installation store in memory, but persistent
storage is strongly recommended for production:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ["chat:write", "commands"],
  installationStore: {
    storeInstallation: async (installation) => {
      if (installation.team !== undefined) {
        return await database.set(installation.team.id, installation);
      }
      throw new Error("Failed to save installation data to installationStore");
    },
    fetchInstallation: async (installQuery) => {
      if (installQuery.teamId !== undefined) {
        return await database.get(installQuery.teamId);
      }
      throw new Error("Failed to fetch installation");
    },
    deleteInstallation: async (installQuery) => {
      if (installQuery.teamId !== undefined) {
        return await database.delete(installQuery.teamId);
      }
      throw new Error("Failed to delete installation");
    },
  },
});
```

Lookups for the `fetchInstallation` handler happen as part of the built-in
[`authorization`][authorization] of incoming events and provides app listeners
with the `context.botToken` object for convenient use.

<details>
  <summary>Example database object</summary>

For quick testing purposes, the following might be interesting:

```javascript
const database = {
  store: {},
  async delete(key) {
    delete this.store[key];
  },
  async get(key) {
    return this.store[key];
  },
  async set(key, value) {
    this.store[key] = value;
  },
};
```

</details>

---

## Additional cases

The above sections set your app up for collecting a bot token on workspace
installations with handfuls of configuration, but other cases might still be
explored.

### User tokens

User tokens represent workspace members and can be used to
[take action on behalf of users][user-tokens]. Requesting user scopes during
installation is required for these tokens to be issued:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ["chat:write", "channels:history"],
  installerOptions: {
    userScopes: ["chat:write"],
  },
});
```

Most OAuth processes remain the same, but the
[`installation`](#the-installation-object) object received in
`storeInstallation` has a `user` attribute that should be stored too:

```javascript
{
  team: { id: "T012345678", name: "example-team-name" },
  user: {
    token: "xoxp-314159-26*********-********************",
    scopes: ["chat:write"],
    id: "U012345678"
  },
  tokenType: "bot",
  appId: "A01234567",
  // ...
}
```

Successful `fetchInstallation` lookups will also include the `context.userToken`
object associated with the received event in the app listener arguments.

:::note

The `tokenType` value remains `"bot"` while `scopes` are requested, even with
the included `userScopes`. This suggests `bot` details exist, and is `undefined`
along with the `bot` if no bot `scopes` are requested.

:::

### Org-wide installations

To add support for [org-wide installations][org-ready], you will need Bolt for
JavaScript version `3.0.0` or later. Make sure you have enabled org-wide
installation in your app configuration settings under **Org Level Apps**.

#### Admin installation state verficiation

Installing an [org-wide](https://api.slack.com/enterprise/apps) app from admin
pages requires additional configuration to work with Bolt. In that scenario, the
recommended `state` parameter is not supplied. Bolt will try to verify `state`
and stop the installation from progressing.

You may disable state verification in Bolt by setting the `stateVerification`
option to false. See the example setup below:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  scopes: ["chat:write"],
  installerOptions: {
    // highlight-next-line
    stateVerification: false,
  },
});
```

To learn more about the OAuth installation flow with org-wide apps,
[read the API documentation][org-ready-oauth].

#### Org-wide installation objects

Being installed to an organization can grant your app access to multiple
workspaces and the associated events.

##### The org-wide `installation` object

The `installation` object from installations to a team in an organization have
an additional `enterprise` object and `isEnterpriseInstall` set to either `true`
or `false`:

```javascript
{
  team: undefined,
  enterprise: { id: "E0000000001", name: "laboratories" },
  user: { token: undefined, scopes: undefined, id: "U0000000001" },
  tokenType: "bot",
  isEnterpriseInstall: true,
  appId: "A0000000001",
  authVersion: "v2",
  bot: {
    scopes: [
      "chat:write",
    ],
    token: "xoxb-000001-00*********-********************",
    userId: "U0000000002",
    id: "B0000000001"
  }
}
```

Apps installed org-wide will receive the `isEnterpriseInstall` parameter as
`true`, but apps could also still be installed to individual workspaces in
organizations. These apps receive installation information for both the `team`
and `enterprise` parameters:

```javascript
{
  team: { id: "T0000000001", name: "experimental-sandbox" },
  enterprise: { id: "E0000000001", name: "laboratories" },
  // ...
  isEnterpriseInstall: false,
  // ...
}
```

##### The org-wide `installQuery` object

This `installQuery` object provided to the `fetchInstallation` and
`deleteInstallation` handlers is the same as ever, but now with an additional
value, `enterpriseId`, defined and another possible `true` or `false` value for
`isEnterpriseInstall`:

```javascript
{
  userId: "U0000000001",
  isEnterpriseInstall: true,
  teamId: "T0000000001",
  enterpriseId: "E0000000001",
  conversationId: "D0000000001"
}
```

#### Org-wide installation store

Storing and retrieving installations from an installation store requires similar
handling as before, but with additional checks for org-wide installations of
org-ready apps:

```javascript
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ["chat:write", "commands"],
  // highlight-start
  installationStore: {
    storeInstallation: async (installation) => {
      if (
        installation.isEnterpriseInstall &&
        installation.enterprise !== undefined
      ) {
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        return await database.set(installation.team.id, installation);
      }
      throw new Error("Failed to save installation data to installationStore");
    },
    fetchInstallation: async (installQuery) => {
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        return await database.get(installQuery.teamId);
      }
      throw new Error("Failed to fetch installation");
    },
    deleteInstallation: async (installQuery) => {
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        return await database.delete(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        return await database.delete(installQuery.teamId);
      }
      throw new Error("Failed to delete installation");
    },
  },
  // highlight-end
});
```

<details>
  <summary>Example database object</summary>

For quick testing purposes, the following might be interesting:

```javascript
const database = {
  store: {},
  async get(key) {
    return this.store[key];
  },
  async delete(key) {
    delete this.store[key];
  },
  async set(key, value) {
    this.store[key] = value;
  },
};
```

</details>

### Sign in with Slack

Right now Bolt does not support [Sign in with Slack][siws] out-of-the-box. This
still continues to remain an option using APIs from the
[`@slack/web-api`][web-api] package, which aim to make implementing OpenID
Connect (OIDC) connections simple. Alternative [routes][custom-routes] might be
required.

Explore [this relevant package documentation][oidc] for reference and example.

### Extra authorizations

If you need additional authorizations or permissions, such as user scopes for
user tokens from users of a team where your app is already installed, or have a
reason to dynamically generate an install URL, an additional installation is
required.

Generating a new installation URL requires a few steps:

1. Manually instantiate an `ExpressReceiver` instance.
2. Assign the instance to a variable named `receiver`.
3. Call the `receiver.installer.generateInstallUrl()` function.

Read more about `generateInstallUrl()` in the
["Manually generating installation page URL"][generate-install-url] section of
the `@slack/oauth` docs.

### Common errors

Occasional mishaps in various places throughout the OAuth process can cause
errors, but these often have meaning! Explore [the API documentation][errors]
for additional details for common error codes.

[add-to-slack]: https://github.com/slackapi/node-slack-sdk/blob/main/packages/oauth/src/default-render-html-for-install-path.ts
[app-settings]: https://api.slack.com/apps
[authorization]: /concepts/authorization
[callback-default-failure]: https://github.com/slackapi/node-slack-sdk/blob/e5a4f3fbbd4f6aad9fdd415976f80668b01fd442/packages/oauth/src/callback-options.ts#L127-L162
[callback-default-success]: https://github.com/slackapi/node-slack-sdk/blob/e5a4f3fbbd4f6aad9fdd415976f80668b01fd442/packages/oauth/src/callback-options.ts#L81-L125
[callback-options]: https://slack.dev/node-slack-sdk/reference/oauth/interfaces/CallbackOptions
[callback-options-default]: https://github.com/slackapi/node-slack-sdk/blob/e5a4f3fbbd4f6aad9fdd415976f80668b01fd442/packages/oauth/src/callback-options.ts#L81-L162
[callbacks]: https://slack.dev/node-slack-sdk/reference/oauth/interfaces/CallbackOptions
[custom-routes]: /concepts/custom-routes
[direct-install]: https://github.com/slackapi/bolt-js/blob/5b4d9ceb65e6bf5cf29dfa58268ea248e5466bfb/examples/oauth/app.js#L58-L64
[errors]: https://api.slack.com/authentication/oauth-v2#errors
[examples]: https://github.com/slackapi/bolt-js/tree/main/examples/oauth
[generate-install-url]: https://slack.dev/node-slack-sdk/oauth/#using-handleinstallpath
[install-provider-options]: https://github.com/slackapi/node-slack-sdk/blob/main/packages/oauth/src/install-provider-options.ts
[installation-page]: https://slack.dev/node-slack-sdk/oauth/#showing-an-installation-page
[installation-store]: https://slack.dev/node-slack-sdk/reference/oauth/interfaces/InstallationStore
[installation-store-file]: https://github.com/slackapi/node-slack-sdk/blob/main/packages/oauth/src/installation-stores/file-store.ts
[oauth-node]: https://slack.dev/node-slack-sdk/oauth
[oauth-v2]: https://api.slack.com/authentication/oauth-v2
[oidc]: https://slack.dev/node-slack-sdk/web-api#sign-in-with-slack-via-openid-connect
[org-ready]: https://api.slack.com/enterprise/org-ready-apps
[org-ready-oauth]: https://api.slack.com/enterprise/org-ready-apps#oauth
[scopes]: https://api.slack.com/scopes
[settings]: https://api.slack.com/apps
[siws]: https://api.slack.com/authentication/sign-in-with-slack
[state]: https://slack.dev/node-slack-sdk/oauth#using-a-custom-state-store
[state-store]: https://slack.dev/node-slack-sdk/reference/oauth/interfaces/StateStore
[state-store-clear]: https://github.com/slackapi/node-slack-sdk/blob/main/packages/oauth/src/state-stores/clear-state-store.ts
[store]: https://slack.dev/node-slack-sdk/oauth#storing-installations-in-a-database
[user-tokens]: https://api.slack.com/concepts/token-types#user
[verification]: https://slack.dev/node-slack-sdk/oauth#state-verification
[web-api]: https://slack.dev/node-slack-sdk/web-api
