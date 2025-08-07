[@slack/bolt](../index.md) / matchMessage

# Function: matchMessage()

```ts
function matchMessage(pattern): Middleware<SlackEventMiddlewareArgs<"message" | "app_mention">>;
```

Defined in: [src/middleware/builtin.ts:230](https://github.com/slackapi/bolt-js/blob/main/src/middleware/builtin.ts#L230)

## Parameters

### pattern

`string` | `RegExp`

## Returns

[`Middleware`](../type-aliases/Middleware.md)\<[`SlackEventMiddlewareArgs`](../type-aliases/SlackEventMiddlewareArgs.md)\<`"message"` \| `"app_mention"`\>\>
