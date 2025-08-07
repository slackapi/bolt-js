[@slack/bolt](../index.md) / SlackEventMiddlewareArgs

# Type Alias: SlackEventMiddlewareArgs\<EventType\>

```ts
type SlackEventMiddlewareArgs<EventType> = object & EventType extends "message" ? object : unknown & EventFromType<EventType> extends 
  | {
  channel: string;
}
  | {
  item: {
     channel: string;
  };
} ? object : unknown & EventType extends "function_executed" ? object : object;
```

Defined in: [src/types/events/index.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L10)

Arguments which listeners and middleware receive to process an event from Slack's Events API.

## Type declaration

### body

```ts
body: EnvelopedEvent<EventFromType<EventType>>;
```

### event

```ts
event: EventFromType<EventType>;
```

### payload

```ts
payload: EventFromType<EventType>;
```

## Type Parameters

### EventType

`EventType` *extends* `string` = `string`
