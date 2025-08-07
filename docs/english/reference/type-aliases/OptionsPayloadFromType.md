[@slack/bolt](../index.md) / OptionsPayloadFromType

# Type Alias: OptionsPayloadFromType\<T\>

```ts
type OptionsPayloadFromType<T> = KnownOptionsPayloadFromType<T> extends never ? BasicOptionsPayload<T> : KnownOptionsPayloadFromType<T>;
```

Defined in: [src/types/options/index.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L38)

## Type Parameters

### T

`T` *extends* `string`
