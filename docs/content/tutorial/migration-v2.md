---
title: Migrating to V2
slug: migration-v2
lang: en---
---

This guide will walk you through the process of updating your app from using `@slack/bolt@1.x` to `@slack/bolt@2.x`. There are a few changes you'll need to make but for most apps, these changes can be applied in 5 - 15 minutes.

:::info 

Make sure to checkout our [support schedule](#slackbolt1x-support-schedule) for `@slack/bolt@1.x` if you don't plan on upgrading right away*

:::

---

### Upgrading your listeners to `async` {#upgrading-your-listeners-to-async}

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


### Error handling {#error-handling}

The recent changes in Bolt for JavaScript V2 have improved our ability to catch errors and filter them to the global error handler.  It is still recommended to manage errors in the listeners themselves instead of letting them propagate to the global handler when possible.

#### Handling errors in listeners with `try`/`catch`

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

#### Handling errors with the global error handler

```javascript
app.error(async (error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error);
});
```

Other error related changes include:

- When your listener doesn’t call `ack` within the 3 second time limit, we log the failure instead of throwing an error.
- If multiple errors occur when processing multiple listeners for a single event, Bolt for JavaScript will return a wrapper error with a `code` property of `ErrorCode.MultipleListenerError` and an `originals` property that contains an array of the individual errors. 


### Message shortcuts {#message-shortcuts}

[Message shortcuts](https://api.slack.com/interactivity/shortcuts/using#message_shortcuts) (previously referred to as message actions) now use the `shortcut()` method instead of the `action()` method.

Before:

```javascript
app.action({ callback_id: 'message-action-callback' }, ({action, ack, context}) => {
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

### Upgrading middleware {#upgrading-middleware}

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

### @slack/bolt@1.x support schedule {#slackbolt1x-support-schedule}

`@slack/bolt@1.x` will be deprecated on **June 30th, 2020**. We plan on continuing to implement bug fixes and will also consider back-porting new features on a case by case basis up until then. Once `@slack/bolt@1.x` has been deprecated, we will only implement **critical bug fixes** until the official end of life date and close non critical issues and pull requests. End of life is slated for **April 30th, 2021**. At this time, development will fully stop for `@slack/bolt@1.x` and all remaining open issues and pull requests will be closed. 

### Minimum TypeScript version {#minimum-typescript-version}

`@slack/bolt@2.x` requires a minimum TypeScript version of 3.7.
