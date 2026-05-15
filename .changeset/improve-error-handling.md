---
"@slack/bolt": minor
---

Improve error handling by leveraging `@slack/web-api` v8 error classes. Authorization errors are now properly wrapped (preserving the original error's class identity). Default error handlers log richer details for web-api errors (API error codes, rate limit durations, HTTP status codes). Re-export `SlackError`, `WebAPIPlatformError`, `WebAPIRequestError`, `WebAPIHTTPError`, and `WebAPIRateLimitedError` from the package entry point.
