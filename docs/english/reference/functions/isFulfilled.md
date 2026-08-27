[@slack/bolt](../index.md) / isFulfilled

# Function: isFulfilled()

```ts
function isFulfilled<T>(p): p is PromiseFulfilledResult<T>;
```

Defined in: [src/types/utilities.ts:18](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L18)

Type predicate for use with `Promise.allSettled` for filtering for resolved results.

## Type Parameters

### T

`T`

## Parameters

### p

`PromiseSettledResult`\<`T`\>

## Returns

`p is PromiseFulfilledResult<T>`
