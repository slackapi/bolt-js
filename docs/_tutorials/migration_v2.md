---
title: Migrating to V2
order: 1
slug: migration-v2
lang: en
layout: tutorial
permalink: /tutorial/migration-v2
---
# Migrating to v2.x

<div class="section-content">
This guide will walk you through the process of updating your app from using `bolt@v1.x` to `bolt@2.x`. 
</div> 

---

## Upgrading your listeners to `async`

Listeners in your app should updated to `async` functions and `say()`,  `respond()`, and `ack()` should be prefaced with `await`.

Before:

```javascript
app.action('some-action-id', ({action, ack, say}) => { 
  ack();
  say('hello world');
})
```

After:

```javascript
app.action('some-action-id', async ({action, ack, say}) => { 
  await ack();
  await say('hello world');
})
```


## Error Handling

The recent changes in Bolt for JavaScript V2 have improved our ability to catch errors and filter them to the global error handler.  It is still recommended to manage errors in the listeners themselves instead of letting them propagate to the global handler when possible.

### Handling Errors in Listeners with `try`/`catch`

```javascript
app.action('some-action-id', async ({action, ack, say, logger}) => { 
  try {
    await ack();
    await say('hello world');
  } catch (error) {
    logger.error(error);
    // handle error
  }
})
```

### Handling Errors with the Global Error Handler

```javascript
app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});
```

Other error related changes include:

- When your listener doesn’t call `ack` within the 3 section time limit, we log the failure instead of throwing an error.
- If you have multiple errors at once when running middleware, Bolt for Javascript will return a wrapper error with a `code` parameter of `slack_bolt_multiple_listener_error` and an `original` parameter that contains an array of all of the errors. 


## Message Shortcuts

[Message shortcuts](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts) (previously referred to as message actions) now use the `shortcut()` method instead of the `action()` method.

Before:

```javascript
app.action('message-action-callback', ({action, ack, context}) => {
  ack();
  // Do stuff
})
```

After:

```javascript
app.shortcut('message-action-callback', async ({shortcut, ack, context}) => {
  await ack();
  // Do stuff
})
```

## Upgrading Middleware

If you wrote a custom middleware, adjust your function to `async`  and update `next()` to `await next()`. If your middleware does some post processing, instead of passing a function to `next()`, you can now run it after `await next()`.

Before:

```javascript
function noBotMessages({ message, next }) {
  function doAfter() { 
    // Post processing goes here
  }

if (!message.subtype || message.subtype !== 'bot_message') {
    next(doAfter);
  }
}
```

After:

```javascript
async function noBotMessages({ message, next }) {
  if (!message.subtype || message.subtype !== 'bot_message') {
    await next();
    // Post processing goes here
  }
}
```