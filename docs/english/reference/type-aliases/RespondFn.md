---
sidebar_label: "RespondFn"
---

[@slack/bolt](../index.md) / RespondFn

# Type Alias: RespondFn

```ts
type RespondFn = (message) => Promise<Awaited<ReturnType<FetchFunction>>>;
```

Defined in: [src/types/utilities.ts:43](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L43)

## Parameters

### message

`string` \| [`RespondArguments`](RespondArguments.md)

## Returns

`Promise`\<`Awaited`\<`ReturnType`\<`FetchFunction`\>\>\>
