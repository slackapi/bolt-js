[@slack/bolt](../index.md) / isRejected

# Function: isRejected()

```ts
function isRejected<T>(p): p is PromiseRejectedResult;
```

Defined in: [src/types/utilities.ts:20](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L20)

Type predicate for use with `Promise.allSettled` for filtering for rejected results.

## Type Parameters

### T

`T`

## Parameters

### p

`PromiseSettledResult`\<`T`\>

## Returns

`p is PromiseRejectedResult`
