---
"@slack/bolt": minor
---

Enforce a configurable request body size limit in `HTTPReceiver` and `ExpressReceiver` to prevent unauthenticated large-body denial-of-service attempts. Both receivers previously buffered the entire request body into memory *before* signature verification, so a flood of large invalid requests could exhaust memory and crash a publicly exposed app.

Both receivers now reject request bodies larger than a new `bodyLimit` option with an HTTP `413` response before the whole body is buffered. The limit is enforced on the bytes actually received (not the `Content-Length` header, which a client controls) and applies even when `signatureVerification` is `false`. It defaults to `4194304` (4 MB); pass a different `number` of bytes, a `bytes`-style string like `'4mb'`, or `Infinity` to disable it (not recommended in production).

This is a security fix with a minor behavioral change: requests with bodies larger than 4 MB are now rejected with `413` by default (previously unbounded). Apps that legitimately receive larger payloads can raise `bodyLimit` on the receiver.
