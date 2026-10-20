---
"@slack/bolt": patch
---

Fix `context.userId` being `undefined` for events whose payload does not carry a user field directly, by sourcing the user ID from the request's `authorizations` array in `buildSource`, matching how `teamId` and `enterpriseId` are already resolved.
