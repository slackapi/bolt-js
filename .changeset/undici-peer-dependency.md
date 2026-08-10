---
"@slack/bolt": patch
---

Declare `undici` as a peer dependency (`^7.0.0`). `@slack/bolt` constructs a `SocketModeClient` from `@slack/socket-mode@3`, which requires `undici@^7` as a peer. Consumers on strict package managers (Yarn Berry, pnpm) should install `undici` alongside `@slack/bolt`. Resolves #3039.
