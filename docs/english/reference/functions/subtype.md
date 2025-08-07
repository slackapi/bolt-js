[@slack/bolt](../index.md) / subtype

# Function: subtype()

```ts
function subtype(subtype1): Middleware<SlackEventMiddlewareArgs<"message">>;
```

Defined in: [src/middleware/builtin.ts:346](https://github.com/slackapi/bolt-js/blob/main/src/middleware/builtin.ts#L346)

Filters out any message events whose subtype does not match the provided subtype.

## Parameters

### subtype1

`string`

## Returns

[`Middleware`](../type-aliases/Middleware.md)\<[`SlackEventMiddlewareArgs`](../type-aliases/SlackEventMiddlewareArgs.md)\<`"message"`\>\>
