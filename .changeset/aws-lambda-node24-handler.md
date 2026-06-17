---
"@slack/bolt": patch
---

Fix `AwsLambdaReceiver.toHandler()` so Bolt apps on the AWS Lambda Node.js 24+ runtime no longer fail at startup with `Runtime.CallbackHandlerDeprecated`. The returned handler is now a 2-arg promise-based function; the unused trailing `callback` parameter has been removed from the `AwsHandler` type. The legacy `AwsCallback` export is retained and marked `@deprecated`.
