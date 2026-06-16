---
"@slack/bolt": patch
---

Pass the App's named `bolt-app` ConsoleLogger to the default receivers when no `logger` option is provided. Previously the App constructor built a named logger on `this.logger` but threaded the raw (potentially undefined) constructor argument into `initReceiver`, so `HTTPReceiver` / `SocketModeReceiver` built their own anonymous loggers and receiver-side log lines (e.g. unhandled HTTP requests on custom routes) appeared without the `bolt-app` name prefix.
