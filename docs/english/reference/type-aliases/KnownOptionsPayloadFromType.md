# KnownOptionsPayloadFromType\<T\>

```ts
type KnownOptionsPayloadFromType<T> = Extract<SlackOptions, {
  type: T;
}>;
```

Defined in: [src/types/options/index.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L40)

## Type Parameters

### T

`T` *extends* `string`
