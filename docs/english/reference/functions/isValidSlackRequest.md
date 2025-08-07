[@slack/bolt](../index.md) / isValidSlackRequest

# Function: isValidSlackRequest()

```ts
function isValidSlackRequest(options): boolean;
```

Defined in: [src/receivers/verify-request.ts:71](https://github.com/slackapi/bolt-js/blob/main/src/receivers/verify-request.ts#L71)

Verifies the signature of an incoming request from Slack.
If the request is invalid, this method returns false.

## Parameters

### options

`SlackRequestVerificationOptions`

## Returns

`boolean`
