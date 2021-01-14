---
title: Listener middleware
lang: en
slug: listener-middleware
order: 5
---

<div class="section-content">
Listener middleware is used for logic across many listener functions (but usually not all of them). They are added as arguments before the listener function in one of the built-in methods. You can add any number of listener middleware before the listener function.

There’s a collection of built-in listener middleware that you can use like `subtype()` for filtering on a message subtype and `directMention()` which filters out any message that doesn’t directly @-mention your bot at the beginning of the message. 

As an example, let's say your listener should only deal with messages that mention your bot directly. You can use the `directMention()` middleware to respond to these messages.

*Note: Since v2, listener middleware was updated to support `async` functions! View the [migration guide for V2](https://slack.dev/bolt/tutorial/migration-v2) to learn about the changes.*
</div>

```javascript
// Listens for incoming messages that start with @-mention to your bot and contain "tell a joke"
app.message(directMention(), 'tell a joke', async ({ message, say }) => {
  // Responds with a joke
  await say(`Here's a joke for you, <@${message.user}>:`);
  await say(`What's Beethoven's favorite fruit?`);
  await say(`Bah-Nah-Nah-Nah!`)
});
```

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">Customizing listener middleware</h4>
</summary>

<div class="secondary-content" markdown="0">
Of course, you can write your own middleware for more custom functionality. While writing your own middleware, your function must call `await next()` to pass control to the next middleware, or `throw` to pass an error back up the previously-executed middleware chain.

As an example, let’s say your listener should only deal with messages from humans. You can write a listener middleware that excludes any bot messages.
</div>


```javascript
// Listener middleware that filters out messages with 'bot_message' subtype
async function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
  }
}

// The listener only receives messages from humans
app.message(noBotMessages, async ({ message }) => console.log(
  `(MSG) User: ${message.user}
   Message: ${message.text}`
));
```

