---
"@slack/bolt": patch
---

Pass the App's named `bolt-app` `ConsoleLogger` to the default receivers when no `logger` option is provided. Previously the App constructor built a named logger on `this.logger` but threaded the raw (potentially undefined) constructor argument into `initReceiver`, so `HTTPReceiver` / `SocketModeReceiver` each built their own anonymous logger and receiver-side log lines (e.g. unhandled HTTP requests on custom routes) appeared without the `bolt-app` prefix.

Behaviour change for the no-`logger` case: the default receiver now shares the same `Logger` instance as `app.logger`, so a downstream `app.logger.setLevel(...)` after construction will affect receiver-side logging too. This is consistent with the existing behaviour that already mutates `this.logger`'s level via the `logLevel` constructor option. Apps that supplied their own `logger` are unaffected; apps that relied on the receiver's logger being independent of `app.logger` will need to pass a separate `logger` into the receiver explicitly.
