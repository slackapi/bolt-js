---
title: Adding Custom HTTP routes 
lang: en
slug: custom-routes
order: 10
---

<div class="section-content">
As of `v3.7.0`, custom HTTP routes can be easily added by passing in a collection of routes as `customRoutes` when initializing `App`. 

Each `CustomRoute` object must contain three properties: `path`, `method`, and `callback`. `method`, which corresponds to the HTTP verb, can be either a string or an array of strings.
</div>

```javascript
const { App } = require('@slack/bolt');

// Create the Bolt App, using the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  customRoutes: [
    {
      path: '/health-check',
      method: ['GET'],
      callback: (req, res) => {
        res.writeHead(200);
        res.end('Health check information displayed here!');
      },
    },
  ],
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