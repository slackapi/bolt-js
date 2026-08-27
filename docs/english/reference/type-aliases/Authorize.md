# Type Alias: Authorize\<IsEnterpriseInstall\>

```ts
type Authorize<IsEnterpriseInstall> = (source, body?) => Promise<AuthorizeResult>;
```

Defined in: [src/App.ts:163](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L163)

Authorization function - seeds the middleware processing and listeners with an authorization context

## Type Parameters

### IsEnterpriseInstall

`IsEnterpriseInstall` *extends* `boolean` = `false`

## Parameters

### source

[`AuthorizeSourceData`](../interfaces/AuthorizeSourceData.md)\<`IsEnterpriseInstall`\>

### body?

[`AnyMiddlewareArgs`](AnyMiddlewareArgs.md)\[`"body"`\]

## Returns

`Promise`\<[`AuthorizeResult`](../interfaces/AuthorizeResult.md)\>
