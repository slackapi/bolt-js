[@slack/bolt](../index.md) / verifySlackRequest

# Function: verifySlackRequest()

```ts
function verifySlackRequest(options): void;
```

Defined in: [src/receivers/verify-request.ts:26](https://github.com/slackapi/bolt-js/blob/main/src/receivers/verify-request.ts#L26)

Verifies the signature of an incoming request from Slack.
If the request is invalid, this method throws an exception with the error details.

## Parameters

### options

`SlackRequestVerificationOptions`

## Returns

`void`
