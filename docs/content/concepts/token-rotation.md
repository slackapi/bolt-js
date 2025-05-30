---
title: Token rotation
lang: en
slug: /concepts/token-rotation
---

Supported in Bolt for JavaScript as of v3.5.0, token rotation provides an extra layer of security for your access tokens and is defined by the [OAuth V2 RFC](https://datatracker.ietf.org/doc/html/rfc6749#section-10.4).

Instead of an access token representing an existing installation of your Slack app indefinitely, with token rotation enabled, access tokens expire. A refresh token acts as a long-lived way to refresh your access tokens.

Bolt for JavaScript will rotate tokens automatically in response to incoming events so long as the [built-in OAuth](/concepts/authenticating-oauth) functionality is used.

To rotate tokens on a separate schedule, consider implementing the `InstallProvider` from the [`@slack/oauth`](https://tools.slack.dev/node-slack-sdk/oauth) package for use of the provided `authorize` method:

```js
const { InstallProvider } = require("@slack/oauth");

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
});

async function rotateTokenBeforeUsing(query) {
  return await installer.authorize({
    enterpriseId: query.enterpriseId,
    teamId: query.teamId,
    // User tokens can also be rotated if needed
    // userId: query.userId,
  });
}
```

The above implementation also requires an installation [store](https://tools.slack.dev/node-slack-sdk/oauth/#storing-installations-in-a-database) to fetch and store installation information according to the incoming installation query.

For more information about token rotation, please see the [documentation](https://docs.slack.dev/authentication/using-token-rotation).
