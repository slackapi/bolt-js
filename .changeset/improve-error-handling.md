---
"@slack/bolt": minor
---

Improve error handling by leveraging `@slack/web-api` v8 error classes. Authorization errors are now properly wrapped in an `AuthorizationError`, preserving the original thrown value (non-`Error` rejections are retained via the `cause` of the wrapped original). Default error handlers log richer details for web-api errors (API error codes, rate limit durations, HTTP status codes) alongside the full error object, so stack traces and causes remain available. The `@slack/web-api` error classes (`SlackError`, `WebAPIPlatformError`, `WebAPIRequestError`, `WebAPIHTTPError`, `WebAPIRateLimitedError`) can be imported from `@slack/web-api` for `instanceof` checks.
