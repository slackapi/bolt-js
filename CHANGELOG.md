# @slack/bolt

## 5.0.1

### Patch Changes

- b9acd4f: Fix `AwsEventV1.multiValueQueryStringParameters` to allow `null`, matching the actual AWS API Gateway payload and the `@types/aws-lambda` `APIGatewayProxyEvent` type. This resolves the type error when passing an `APIGatewayProxyEvent` directly to the handler returned by `AwsLambdaReceiver`.

## 5.0.0

### Major Changes

- d284e69: Drop Node.js 18 support. The minimum required runtime is now Node.js 20 (npm >=9.6.4).
- d284e69: Remove deprecated `WorkflowStep` class and all associated types, middleware, and utilities. Use `CustomFunction` and `app.function()` instead.
- d284e69: Replace axios with native fetch for response_url calls. Remove `agent` and `clientTls` options from `AppOptions` — use `clientOptions.fetch` to provide a custom fetch implementation for proxy/TLS needs. Add a `dispatcher` option to `SocketModeReceiver` for proxy/TLS configuration in socket mode.

  `respond()` now throws a `RespondError` when the `response_url` request returns a non-2xx status (restoring the throw-on-failure behavior that axios provided) and resolves to a `Response` on success rather than an axios response object.

### Minor Changes

- d284e69: Improve error handling by leveraging `@slack/web-api` v8 error classes. Authorization errors are now properly wrapped in an `AuthorizationError`, preserving the original thrown value (non-`Error` rejections are retained via the `cause` of the wrapped original). Default error handlers log richer details for web-api errors (API error codes, rate limit durations, HTTP status codes) alongside the full error object, so stack traces and causes remain available. The `@slack/web-api` error classes (`SlackError`, `WebAPIPlatformError`, `WebAPIRequestError`, `WebAPIHTTPError`, `WebAPIRateLimitedError`) can be imported from `@slack/web-api` for `instanceof` checks.

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
