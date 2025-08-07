[@slack/bolt](../index.md) / KnownEventFromType

# Type Alias: KnownEventFromType\<T\>

```ts
type KnownEventFromType<T> = Extract<SlackEvent, {
  type: T;
}>;
```

Defined in: [src/types/events/index.ts:75](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L75)

## Type Parameters

### T

`T` *extends* `string`
