---
title: Listener middleware
lang: en
slug: listener-middleware
order: 5
---

<div class="section-content">
Listener middleware is used for logic across many listener functions (but usually not all of them). They are added as arguments before the listener function in one of the built-in methods. You can add any number of listener middleware before the listener function.

There’s a collection of built-in listener middleware that you can use like `subtype()` for filtering on a message subtype and `directMention()` which filters out any message that doesn’t directly @-mention your bot.

But of course, you can write your own middleware for more custom functionality. While writing your own middleware, your function must call `next()` to pass control to the next middleware, or call `next(error)` to pass an error back up the previously-executed middleware chain.

As an example, let’s say your listener should only deal with messages from humans. You can write a listener middleware that excludes any bot messages.

</div>

```javascript
// Listener middleware that filters out messages with 'bot_message' subtype
function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    next();
  }
}

// The listener only receives messages from humans
app.message(noBotMessages, ({ message }) => console.log(
  `(MSG) User: ${message.user}
   Message: ${message.text}`
));
```