# Deferring app initialization

By default, Bolt configures authorization when you create an `App`. When you provide a bot token and leave token verification enabled (the default), this can start an asynchronous `auth.test` call during construction. If the request fails, its rejection may occur outside the caller's `try`/`catch`, even if that block surrounds `new App(...)`.

Set `deferInitialization: true` to run the authorization setup when you explicitly call `await app.init()`. You can then catch errors from initialization, including an invalid or revoked token, before starting the app. This is particularly useful in serverless environments such as AWS Lambda and Firebase Cloud Functions, where an unhandled rejection may terminate the function process.

Deferring initialization **does not disable token verification**. The `auth.test` call is conditional on using a bot token and having token verification enabled; other authorization setups may behave differently.

:::info

When you defer initialization, always call `await app.init()` before `app.start()`. Calling `start()` first throws an initialization error.

:::

## Example

```javascript
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  deferInitialization: true,
});

async function startApp() {
  try {
    // Token verification can be awaited and its errors handled here.
    await app.init();

    // Only start accepting requests after successful initialization.
    await app.start(process.env.PORT || 3000);
  } catch (error) {
    app.logger.error('Failed to initialize or start the app', error);
    process.exitCode = 1;
  }
}

void startApp();
```

This example starts an HTTP receiver for a long-running process. In a serverless function, use the receiver and startup pattern appropriate to the platform (for example, the [AWS Lambda deployment guide](/tools/bolt-js/deployments/aws-lambda)) and await initialization in a controlled asynchronous flow instead of starting a listening server on every invocation.
