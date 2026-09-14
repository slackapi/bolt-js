---
"@slack/bolt": patch
---

Declare `undici` as a peer dependency (`^7.28.0`). `@slack/bolt` constructs a `SocketModeClient` from `@slack/socket-mode@3`, which requires `undici@^7` as a peer. Consumers on strict package managers (Yarn Berry, pnpm) should install `undici` alongside `@slack/bolt`. The `^7.28.0` floor avoids `undici` releases affected by CVE-2026-12151 (GHSA-vxpw-j846-p89q), a high-severity WebSocket denial-of-service. Resolves #3039.
