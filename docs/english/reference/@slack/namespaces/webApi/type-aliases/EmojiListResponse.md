[@slack/bolt](../../../../index.md) / [webApi](../index.md) / EmojiListResponse

# Type Alias: EmojiListResponse

```ts
type EmojiListResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/EmojiListResponse.d.ts:2

## Type declaration

### cache\_ts?

```ts
optional cache_ts: string;
```

### categories?

```ts
optional categories: Category[];
```

### categories\_version?

```ts
optional categories_version: string;
```

### emoji?

```ts
optional emoji: object;
```

#### Index Signature

```ts
[key: string]: string
```

### error?

```ts
optional error: string;
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
