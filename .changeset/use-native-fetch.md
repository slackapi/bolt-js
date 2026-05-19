---
"@slack/bolt": major
---

Replace axios with native fetch for response_url calls. Remove `agent` and `clientTls` options from `AppOptions` — use `clientOptions.fetch` to provide a custom fetch implementation for proxy/TLS needs. Add `dispatcher` option to `SocketModeReceiver` for proxy/TLS configuration in socket mode.
