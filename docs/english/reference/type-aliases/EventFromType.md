[@slack/bolt](../index.md) / EventFromType

# Type Alias: EventFromType\<T\>

```ts
type EventFromType<T> = KnownEventFromType<T> extends never ? BaseSlackEvent<T> : KnownEventFromType<T>;
```

Defined in: [src/types/events/index.ts:72](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L72)

Type function which given a string `T` returns a type for the matching Slack event(s).

When the string matches known event(s) from the `SlackEvent` union, only those types are returned (also as a union).
Otherwise, the `BasicSlackEvent<T>` type is returned.

## Type Parameters

### T

`T` *extends* `string`
