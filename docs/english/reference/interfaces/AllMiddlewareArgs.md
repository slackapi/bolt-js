[@slack/bolt](../index.md) / AllMiddlewareArgs

# Interface: AllMiddlewareArgs\<CustomContext\>

Defined in: [src/types/middleware.ts:20](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L20)

## Type Parameters

### CustomContext

`CustomContext` = [`StringIndexed`](../type-aliases/StringIndexed.md)

## Properties

### client

```ts
client: WebClient;
```

Defined in: [src/types/middleware.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L23)

***

### context

```ts
context: Context & CustomContext;
```

Defined in: [src/types/middleware.ts:21](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L21)

***

### logger

```ts
logger: Logger;
```

Defined in: [src/types/middleware.ts:22](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L22)

***

### next

```ts
next: NextFn;
```

Defined in: [src/types/middleware.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L24)
