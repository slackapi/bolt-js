---
title: Listener middleware
lang: en
slug: /concepts/listener-middleware
---

Listener middleware is used for logic across many listener functions (but usually not all of them). They are added as arguments before the listener function in one of the built-in methods. You can add any number of listener middleware before the listener function.

There’s a collection of [built-in listener middleware](/reference#built-in-listener-middleware-functions) that you can use like `directMention` which filters out any message that doesn’t directly @-mention your bot at the start of a message.

But of course, you can write your own middleware for more custom functionality. While writing your own middleware, your function must call `await next()` to pass control to the next middleware, or `throw` to pass an error back up the previously-executed middleware chain.

As an example, let’s say your listener should only deal with messages from humans. You can write a listener middleware th

```javascript
// Listener middleware that filters out messages with 'bot_message' subtype
async function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
  }
}

// The listener only receives messages from humans
app.message(noBotMessages, async ({ message, logger }) => logger.info(
  // Handle only newly posted messages
  if (message.subtype === undefined
    // || message.subtype === 'bot_message'
    || message.subtype === 'file_share'
    || message.subtype === 'thread_broadcast') {
    logger.info(`(MSG) User: ${message.user} Message: ${message.text}`)
  }
));
```
