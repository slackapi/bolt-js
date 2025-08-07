[@slack/bolt](../index.md) / Middleware

# Type Alias: Middleware()\<Args, CustomContext\>

```ts
type Middleware<Args, CustomContext> = (args) => Promise<void>;
```

Defined in: [src/types/middleware.ts:29](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L29)

## Type Parameters

### Args

`Args`

### CustomContext

`CustomContext` = [`StringIndexed`](StringIndexed.md)

## Parameters

### args

`Args` & [`AllMiddlewareArgs`](../interfaces/AllMiddlewareArgs.md)\<`CustomContext`\>

## Returns

`Promise`\<`void`\>
