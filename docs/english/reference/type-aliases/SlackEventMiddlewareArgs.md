---
sidebar_label: "SlackEventMiddlewareArgs"
---

# SlackEventMiddlewareArgs\<EventType\>

```ts
type SlackEventMiddlewareArgs<EventType> = object & EventType extends "message" ? object : unknown & EventFromType<EventType> extends 
  | {
  channel: string;
}
  | {
  item: {
     channel: string;
  };
} ? object : unknown & EventFromType<EventType> extends EventWithChannelContext ? EventFromType<EventType> extends EventWithThreadTsContext | EventWithTsContext ? object : unknown : unknown & EventType extends "function_executed" ? object : object;
```

Defined in: [src/types/events/index.ts:39](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L39)

Arguments which listeners and middleware receive to process an event from Slack's Events API.

## Type Declaration

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
