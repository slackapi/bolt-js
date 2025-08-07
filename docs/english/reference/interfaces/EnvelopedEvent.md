[@slack/bolt](../index.md) / EnvelopedEvent

# Interface: EnvelopedEvent\<Event\>

Defined in: [src/types/events/index.ts:45](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L45)

A Slack Events API event wrapped in the standard envelope.

This describes the entire JSON-encoded body of a request from Slack's Events API.

## Extends

- [`StringIndexed`](../type-aliases/StringIndexed.md)

## Type Parameters

### Event

`Event` = [`BaseSlackEvent`](BaseSlackEvent.md)

## Indexable

```ts
[key: string]: any
```

## Properties

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/events/index.ts:49](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L49)

***

### authorizations?

```ts
optional authorizations: Authorization[];
```

Defined in: [src/types/events/index.ts:55](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L55)

***

### enterprise\_id?

```ts
optional enterprise_id: string;
```

Defined in: [src/types/events/index.ts:48](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L48)

***

### event

```ts
event: Event;
```

Defined in: [src/types/events/index.ts:50](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L50)

***

### event\_id

```ts
event_id: string;
```

Defined in: [src/types/events/index.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L52)

***

### event\_time

```ts
event_time: number;
```

Defined in: [src/types/events/index.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L53)

***

### is\_ext\_shared\_channel?

```ts
optional is_ext_shared_channel: boolean;
```

Defined in: [src/types/events/index.ts:54](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L54)

***

### team\_id

```ts
team_id: string;
```

Defined in: [src/types/events/index.ts:47](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L47)

***

### token

```ts
token: string;
```

Defined in: [src/types/events/index.ts:46](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L46)

***

### type

```ts
type: "event_callback";
```

Defined in: [src/types/events/index.ts:51](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L51)
