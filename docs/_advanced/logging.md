---
title: Logging
slug: logging
order: 7
---

<div class="section-content">
By default, Bolt will log information from your app to the console. You can customize how much logging occurs by passing a `logLevel` in the constructor. The available log levels in order of most to least logs are `DEBUG`, `INFO`, `WARN`, and `ERROR`. 
</div>

```javascript
// Import LogLevel from the package
const { App, LogLevel } = require('@slack/bolt');

// Log level is one of the options you can set in the constructor
const web = new WebClient(token, {
  logLevel: LogLevel.DEBUG,
});
```

<details markdown="0">
<summary class="section-head">
<h4 class="section-head">Sending log output somewhere besides the console</h4>
</summary>

<div class="secondary-wrapper">

<div class="secondary-content">
If you want to send logs to somewhere besides the console or want more control over the logger, you can implement a logger. A custom logger must implement specific methods (known as the `Logger` interface).
</div>

```javascript
TODO
```

</div>
</details>