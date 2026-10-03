# RespondFn

```ts
type RespondFn = (message) => Promise<Awaited<ReturnType<FetchFunction>>>;
```

Defined in: [src/types/utilities.ts:45](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L45)

## Parameters

### message

`string` \| [`RespondArguments`](RespondArguments.md)

## Returns

`Promise`\<`Awaited`\<`ReturnType`\<`FetchFunction`\>\>\>
