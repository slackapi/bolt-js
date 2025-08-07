[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChannelsHistoryResponse

# Type Alias: ChannelsHistoryResponse

```ts
type ChannelsHistoryResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/ChannelsHistoryResponse.d.ts:2

## Type declaration

### channel\_actions\_count?

```ts
optional channel_actions_count: number;
```

### channel\_actions\_ts?

```ts
optional channel_actions_ts: number;
```

### error?

```ts
optional error: string;
```

### has\_more?

```ts
optional has_more: boolean;
```

### latest?

```ts
optional latest: string;
```

### messages?

```ts
optional messages: Message[];
```

### needed?

```ts
optional needed: string;
```

### ok?

```ts
optional ok: boolean;
```

### provided?

```ts
optional provided: string;
```

### response\_metadata?

```ts
optional response_metadata: ResponseMetadata;
```

### warning?

```ts
optional warning: string;
```
