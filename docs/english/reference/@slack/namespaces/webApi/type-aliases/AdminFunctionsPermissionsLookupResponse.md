[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminFunctionsPermissionsLookupResponse

# Type Alias: AdminFunctionsPermissionsLookupResponse

```ts
type AdminFunctionsPermissionsLookupResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/AdminFunctionsPermissionsLookupResponse.d.ts:2

## Type declaration

### error?

```ts
optional error: string;
```

### errors?

```ts
optional errors: Errors;
```

### metadata?

```ts
optional metadata: object;
```

#### Index Signature

```ts
[key: string]: Errors
```

### needed?

```ts
optional needed: string;
```

### ok?

```ts
optional ok: boolean;
```

### permissions?

```ts
optional permissions: object;
```

#### Index Signature

```ts
[key: string]: Permission
```

### provided?

```ts
optional provided: string;
```

### response\_metadata?

```ts
optional response_metadata: ResponseMetadata;
```
