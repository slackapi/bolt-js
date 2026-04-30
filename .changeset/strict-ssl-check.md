---
"@slack/bolt": patch
---

Require exact `ssl_check=1` value to bypass signature verification, preventing truthy but incorrect values from skipping authentication checks.
