[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsSearchResponse

# Type Alias: AdminConversationsSearchResponse

```ts
type AdminConversationsSearchResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/AdminConversationsSearchResponse.d.ts:2

## Type declaration

### conversations?

```ts
optional conversations: Conversation[];
```

### error?

```ts
optional error: string;
```

### needed?

```ts
optional needed: string;
```

### next\_cursor?

```ts
optional next_cursor: string;
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

### total\_count?

```ts
optional total_count: number;
```
