# @slack/bolt

## 4.7.4

### Patch Changes

- 9839a50: Pass the App's named `bolt-app` `ConsoleLogger` to the default receivers when no `logger` option is provided. Previously the App constructor built a named logger on `this.logger` but threaded the raw (potentially undefined) constructor argument into `initReceiver`, so `HTTPReceiver` / `SocketModeReceiver` each built their own anonymous logger and receiver-side log lines (e.g. unhandled HTTP requests on custom routes) appeared without the `bolt-app` prefix.

  Behaviour change for the no-`logger` case: the default receiver now shares the same `Logger` instance as `app.logger`, so a downstream `app.logger.setLevel(...)` after construction will affect receiver-side logging too. This is consistent with the existing behaviour that already mutates `this.logger`'s level via the `logLevel` constructor option. Apps that supplied their own `logger` are unaffected; apps that relied on the receiver's logger being independent of `app.logger` will need to pass a separate `logger` into the receiver explicitly.

- e1c21d7: Fix `AwsLambdaReceiver.toHandler()` so Bolt apps on the AWS Lambda Node.js 24+ runtime no longer fail at startup with `Runtime.CallbackHandlerDeprecated`. The returned handler is now a 2-arg promise-based function; the unused trailing `callback` parameter has been removed from the `AwsHandler` type. The legacy `AwsCallback` export is retained and marked `@deprecated`.
- f2de079: Add `context_team_id` and `context_enterprise_id` as optional fields on the `EnvelopedEvent` type. Slack's Events API delivers these on the envelope for Slack Connect channels and Enterprise Grid org-wide apps, where `team_id` may refer to a workspace different from the one the bot is installed in. Without the typed fields, downstream code had to reach for `@ts-expect-error` or unsafe casts to route by the correct workspace.

## 4.7.3

### Patch Changes

- 341b60e: Reject empty `signingSecret` at initialization to prevent accidental HMAC signature forgery.

## 4.7.2

### Patch Changes

- 4545150: Require exact `ssl_check=1` value to bypass signature verification, preventing truthy but incorrect values from skipping authentication checks.

## 4.7.1

### Patch Changes

- a18c359: fix: correct InvalidCustomPropertyError code and MemoryStore promise handling
