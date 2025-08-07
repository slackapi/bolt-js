[@slack/bolt](../index.md) / matchCommandName

# Function: matchCommandName()

```ts
function matchCommandName(pattern): Middleware<SlackCommandMiddlewareArgs>;
```

Defined in: [src/middleware/builtin.ts:262](https://github.com/slackapi/bolt-js/blob/main/src/middleware/builtin.ts#L262)

Middleware that filters out any command that doesn't match the pattern

## Parameters

### pattern

`string` | `RegExp`

## Returns

[`Middleware`](../type-aliases/Middleware.md)\<[`SlackCommandMiddlewareArgs`](../interfaces/SlackCommandMiddlewareArgs.md)\>
