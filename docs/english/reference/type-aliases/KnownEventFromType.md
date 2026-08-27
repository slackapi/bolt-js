# KnownEventFromType\<T\>

```ts
type KnownEventFromType<T> = Extract<SlackEvent, {
  type: T;
}>;
```

Defined in: [src/types/events/index.ts:110](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L110)

## Type Parameters

### T

`T` *extends* `string`
