[@slack/bolt](../../../../index.md) / [webApi](../index.md) / MpimHistoryResponse

# Type Alias: MpimHistoryResponse

```ts
type MpimHistoryResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/MpimHistoryResponse.d.ts:2

## Type declaration

### channel\_actions\_count?

```ts
optional channel_actions_count: number;
```

### error?

```ts
optional error: string;
```

### has\_more?

```ts
optional has_more: boolean;
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
