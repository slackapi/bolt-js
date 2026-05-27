---
"@slack/bolt": patch
---

Reject empty `signingSecret` at initialization to prevent accidental HMAC signature forgery.
