---
"@slack/bolt": patch
---

Fix `AwsEventV1.multiValueQueryStringParameters` to allow `null`, matching the actual AWS API Gateway payload and the `@types/aws-lambda` `APIGatewayProxyEvent` type. This resolves the type error when passing an `APIGatewayProxyEvent` directly to the handler returned by `AwsLambdaReceiver`.
