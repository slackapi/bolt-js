[@slack/bolt](../index.md) / XOR

# Type Alias: XOR\<T, U\>

```ts
type XOR<T, U> = T | U extends Record<string, unknown> ? Without<T, U> & U | Without<U, T> & T : T | U;
```

Defined in: [src/types/utilities.ts:13](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L13)

Type function which allows either types `T` or `U`, but not both.

## Type Parameters

### T

`T`

### U

`U`
