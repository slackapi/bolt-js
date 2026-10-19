---
"@slack/bolt": minor
---

Declare `undici` as a peer dependency (`^7.0.0 || ^8.0.0`), matching `@slack/socket-mode`. `@slack/bolt` constructs a `SocketModeClient` from `@slack/socket-mode@3`, which requires `undici` as a peer. Consumers on strict package managers (Yarn Berry, pnpm) should install `undici` alongside `@slack/bolt`. `undici@^8` requires Node.js >=22.19; on Node.js 20, install `undici@^7`. Resolves #3039.
