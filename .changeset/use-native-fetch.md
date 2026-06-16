---
"@slack/bolt": major
---

Replace axios with native fetch for response_url calls. Remove `agent` and `clientTls` options from `AppOptions` — use `clientOptions.fetch` to provide a custom fetch implementation for proxy/TLS needs. Add a `dispatcher` option to `SocketModeReceiver` for proxy/TLS configuration in socket mode.

`respond()` now throws a `RespondError` when the `response_url` request returns a non-2xx status (restoring the throw-on-failure behavior that axios provided) and resolves to a `Response` on success rather than an axios response object.
