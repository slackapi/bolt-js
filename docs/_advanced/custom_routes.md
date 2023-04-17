---
title: Adding Custom HTTP routes 
lang: en
slug: custom-routes
order: 10
---

<div class="section-content">
As of `v3.7.0`, custom HTTP routes can be easily added by passing in an array of routes as `customRoutes` when initializing `App`. 

Each `CustomRoute` object must contain three properties: `path`, `method`, and `handler`. `method`, which corresponds to the HTTP verb, can be either a string or an array of strings.

Since `v3.13.0`, the default built-in receivers (`HTTPReceiver` and `SocketModeReceiver`) support dynamic route parameters like [Express.js does](https://expressjs.com/en/guide/routing.html#route-parameters). With this, you can capture positional values in the URL for use in your route's handler via `req.params`.

To determine what port the custom HTTP route will be available on locally, you can specify an `installerOptions.port` property in the `App` constructor. Otherwise, it will default to port `3000`.
</div>

```javascript
const { App } = require('@slack/bolt');

// Initialize Bolt app, using the default HTTPReceiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  customRoutes: [
    {
      path: '/health-check',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end(`Things are going just fine at ${req.headers.host}!`);
      },
    },
    {
      path: '/music/:genre',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end(`Oh? ${req.params.genre}? That slaps!`);
      },
    },
  ],
  installerOptions: {
    port: 3001,
  },
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">Custom ExpressReceiver routes</h4>
</summary>

<div class="secondary-content" markdown="0">
Adding custom HTTP routes is quite straightforward when using Bolt’s built-in ExpressReceiver. Since `v2.1.0`, `ExpressReceiver` added a `router` property, which exposes the Express [Router](http://expressjs.com/en/4x/api.html#router) on which additional routes can be added.
</div>

```javascript
const { App, ExpressReceiver } = require('@slack/bolt');

// Create a Bolt Receiver
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

// Create the Bolt App, using the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});

// Slack interactions are methods on app
app.event('message', async ({ event, client }) => {
  // Do some slack-specific stuff here
  await client.chat.postMessage(...);
});

// Other web requests are methods on receiver.router
receiver.router.post('/secret-page', (req, res) => {
  // You're working with an express req and res now.
  res.send('yay!');
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
})();
```
</details>
