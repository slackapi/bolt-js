[@slack/bolt](../index.md) / isSlackEventMiddlewareArgsOptions

# Function: isSlackEventMiddlewareArgsOptions()

```ts
function isSlackEventMiddlewareArgsOptions<EventType>(optionOrListener): optionOrListener is SlackEventMiddlewareArgsOptions;
```

Defined in: [src/middleware/builtin.ts:67](https://github.com/slackapi/bolt-js/blob/main/src/middleware/builtin.ts#L67)

## Type Parameters

### EventType

`EventType` *extends* `string` = `string`

## Parameters

### optionOrListener

[`SlackEventMiddlewareArgsOptions`](../type-aliases/SlackEventMiddlewareArgsOptions.md) | [`Middleware`](../type-aliases/Middleware.md)\<[`SlackEventMiddlewareArgs`](../type-aliases/SlackEventMiddlewareArgs.md)\<`EventType`\>\>

## Returns

`optionOrListener is SlackEventMiddlewareArgsOptions`
