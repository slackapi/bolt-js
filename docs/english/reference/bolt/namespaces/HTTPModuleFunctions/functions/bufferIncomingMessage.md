# bufferIncomingMessage()

```ts
function bufferIncomingMessage(req, bodyLimit?): Promise<BufferedIncomingMessage>;
```

Defined in: [src/receivers/HTTPModuleFunctions.ts:127](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPModuleFunctions.ts#L127)

## Parameters

### req

`IncomingMessage`

### bodyLimit?

`string` \| `number`

## Returns

`Promise`\<[`BufferedIncomingMessage`](../../../../interfaces/BufferedIncomingMessage.md)\>
