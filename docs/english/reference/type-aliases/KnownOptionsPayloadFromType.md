[@slack/bolt](../index.md) / KnownOptionsPayloadFromType

# Type Alias: KnownOptionsPayloadFromType\<T\>

```ts
type KnownOptionsPayloadFromType<T> = Extract<SlackOptions, {
  type: T;
}>;
```

Defined in: [src/types/options/index.ts:41](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L41)

## Type Parameters

### T

`T` *extends* `string`
