[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminWorkflowsPermissionsLookupResponse

# Type Alias: AdminWorkflowsPermissionsLookupResponse

```ts
type AdminWorkflowsPermissionsLookupResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/AdminWorkflowsPermissionsLookupResponse.d.ts:2

## Type declaration

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
