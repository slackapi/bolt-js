[@slack/bolt](../../../../index.md) / [HTTPModuleFunctions](../index.md) / parseAndVerifyHTTPRequest

# Function: parseAndVerifyHTTPRequest()

```ts
function parseAndVerifyHTTPRequest(
   options, 
   req, 
_res?): Promise<BufferedIncomingMessage>;
```

Defined in: [src/receivers/HTTPModuleFunctions.ts:55](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPModuleFunctions.ts#L55)

## Parameters

### options

[`RequestVerificationOptions`](../../../../interfaces/RequestVerificationOptions.md)

### req

`IncomingMessage`

### \_res?

`ServerResponse`\<`IncomingMessage`\>

## Returns

`Promise`\<[`BufferedIncomingMessage`](../../../../interfaces/BufferedIncomingMessage.md)\>
