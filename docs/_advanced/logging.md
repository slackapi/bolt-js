---
title: Logging
lang: en
slug: logging
order: 7
---

<div class="section-content">
By default, Bolt for JavaScript will log information from your app to the console. You can customize how much logging occurs by passing a `logLevel` in the constructor. The available log levels in order of most to least logs are `DEBUG`, `INFO`, `WARN`, and `ERROR`. 
</div>

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

<details class="secondary-wrapper">
<summary class="section-head" markdown="0">
<h4 class="section-head">Sending log output somewhere besides the console</h4>
</summary>

<div class="secondary-content" markdown="0">
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
</div>

```javascript
const { App } = require('@slack/bolt');
const { createWriteStream } = require('fs');
const logWritable = createWriteStream('/var/my_log_file'); // Not shown: close this stream

const app = new App({
  token,
  signingSecret,
  // Creating a logger as a literal object. It's more likely that you'd create a class.
  logger: {
    debug(...msgs): { logWritable.write('debug: ' + JSON.stringify(msgs)); },
    info(...msgs): { logWritable.write('info: ' + JSON.stringify(msgs)); },
    warn(...msgs): { logWritable.write('warn: ' + JSON.stringify(msgs)); },
    error(...msgs): { logWritable.write('error: ' + JSON.stringify(msgs)); },
    setLevel(): { },
    setName(): { },
  },
});
```

</details>