[@slack/bolt](../index.md) / EnvelopedEvent

# Interface: EnvelopedEvent\<Event\>

Defined in: [src/types/events/index.ts:79](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L79)

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

Defined in: [src/types/events/index.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L85)

***

### authorizations?

```ts
optional authorizations?: Authorization[];
```

Defined in: [src/types/events/index.ts:91](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L91)

***

### context\_enterprise\_id?

```ts
optional context_enterprise_id?: string;
```

Defined in: [src/types/events/index.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L84)

***

### context\_team\_id?

```ts
optional context_team_id?: string;
```

Defined in: [src/types/events/index.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L83)

***

### enterprise\_id?

```ts
optional enterprise_id?: string;
```

Defined in: [src/types/events/index.ts:82](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L82)

***

### event

```ts
event: Event;
```

Defined in: [src/types/events/index.ts:86](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L86)

***

### event\_id

```ts
event_id: string;
```

Defined in: [src/types/events/index.ts:88](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L88)

***

### event\_time

```ts
event_time: number;
```

Defined in: [src/types/events/index.ts:89](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L89)

***

### is\_ext\_shared\_channel?

```ts
optional is_ext_shared_channel?: boolean;
```

Defined in: [src/types/events/index.ts:90](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L90)

***

### team\_id

```ts
team_id: string;
```

Defined in: [src/types/events/index.ts:81](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L81)

***

### token

```ts
token: string;
```

Defined in: [src/types/events/index.ts:80](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L80)

***

### type

```ts
type: "event_callback";
```

Defined in: [src/types/events/index.ts:87](https://github.com/slackapi/bolt-js/blob/main/src/types/events/index.ts#L87)
