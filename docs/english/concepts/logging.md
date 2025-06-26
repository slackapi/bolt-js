---
title: Logging
lang: en
slug: /concepts/logging
---

By default, Bolt for JavaScript will log information from your app to the console. You can customize how much logging occurs by passing a `logLevel` in the constructor. The available log levels in order of most to least logs are `DEBUG`, `INFO`, `WARN`, and `ERROR`.

```javascript
// Import LogLevel from the package
const { App, LogLevel } = require('@slack/bolt');

// Log level is one of the options you can set in the constructor
const app = new App({
  token,
  signingSecret,
  logLevel: LogLevel.DEBUG,
});
```

## Writing logs

The logger included with the constructed `App` can be used to log writings throughout your application code:

```javascript
(async () => {
  app.logger.debug("Starting the app now!");
  await app.start();
  app.logger.info("⚡️ Bolt app started");
})();
```

Different app listeners can use the same `logger` that's provided as an argument to output additional details:

```javascript
app.event("team_join", async ({ client, event, logger }) => {
  logger.info("Someone new just joined the team.");
  try {
    const result = await client.chat.postMessage({
      channel: "C0123456789",
      text: `Welcome to the team, <@${event.user.id}>!`,
    });
    logger.debug(result);
  } catch (error) {
    logger.error(error);
  }
});
```

## Redirecting outputs

If you want to send logs to somewhere besides the console or want more control over the logger, you can implement a custom logger. A custom logger must implement specific methods (known as the `Logger` interface):

| Method       | Parameters        | Return type |
|--------------|-------------------|-------------|
| `setLevel()` | `level: LogLevel` | `void`      |
| `getLevel()` | None              | `string` with value `error`, `warn`, `info`, or `debug`  |
| `setName()`  | `name: string`    | `void`      |
| `debug()`    | `...msgs: any[]`  | `void`      |
| `info()`     | `...msgs: any[]`  | `void`      |
| `warn()`     | `...msgs: any[]`  | `void`      |
| `error()`    | `...msgs: any[]`  | `void`      |

A very simple custom logger might ignore the name and level, and write all messages to a file.

```javascript
const { App } = require('@slack/bolt');
const { createWriteStream } = require('fs');
const logWritable = createWriteStream('/var/my_log_file'); // Not shown: close this stream

const app = new App({
  token,
  signingSecret,
  // Creating a logger as a literal object. It's more likely that you'd create a class.
  logger: {
    debug: (...msgs) => { logWritable.write('debug: ' + JSON.stringify(msgs)); },
    info: (...msgs) => { logWritable.write('info: ' + JSON.stringify(msgs)); },
    warn: (...msgs) => { logWritable.write('warn: ' + JSON.stringify(msgs)); },
    error: (...msgs) => { logWritable.write('error: ' + JSON.stringify(msgs)); },
    setLevel: (level) => { },
    getLevel: () => { },
    setName: (name) => { },
  },
});
```
