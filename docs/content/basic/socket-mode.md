---
title: Using Socket Mode
lang: en
slug: /concepts/socket-mode
---

[Socket Mode](https://api.slack.com/socket-mode) allows your app to connect and receive data from Slack via a WebSocket connection. To handle the connection, Bolt for JavaScript includes a `SocketModeReceiver` (in `@slack/bolt@3.0.0` and higher). Before using Socket Mode, be sure to enable it within your app configuration.

To use the `SocketModeReceiver`, just pass in `socketMode:true` and `appToken:YOUR_APP_TOKEN` when initializing `App`. You can get your App Level Token in your app configuration under the **Basic Information** section.

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```

<details>
<summary>
Custom SocketMode Receiver
</summary>

You can define a custom `SocketModeReceiver` by importing it from `@slack/bolt`.

```javascript
const { App, SocketModeReceiver } = require('@slack/bolt');

const socketModeReceiver = new SocketModeReceiver({
  appToken: process.env.APP_TOKEN,

  // enable the following if you want to use OAuth
  // clientId: process.env.CLIENT_ID,
  // clientSecret: process.env.CLIENT_SECRET,
  // stateSecret: process.env.STATE_SECRET,
  // scopes: ['channels:read', 'chat:write', 'app_mentions:read', 'channels:manage', 'commands'],
});

const app = new App({
  receiver: socketModeReceiver,
  // disable token line below if using OAuth
  token: process.env.BOT_TOKEN
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```

</details>
