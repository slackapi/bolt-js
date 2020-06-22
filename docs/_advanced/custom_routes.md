---
title: Adding Custom HTTP routes 
lang: en
slug: custom-routes
order: 9
---

<div class="section-content">

Adding custom HTTP routes is quite straightforward when using Bolt's built-in `ExpressReceiver`. Since `v2.1.0`, `ExpressReceiver` added a `router` property, which exposes the Express [Router](http://expressjs.com/en/4x/api.html#router) on which more routes can be added.

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
  await app.start(8080);
  console.log('app is running');
})();
```
