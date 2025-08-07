[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminRolesListAssignmentsResponse

# Type Alias: AdminRolesListAssignmentsResponse

```ts
type AdminRolesListAssignmentsResponse = WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/response/AdminRolesListAssignmentsResponse.d.ts:2

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

### provided?

```ts
optional provided: string;
```

### response\_metadata?

```ts
optional response_metadata: ResponseMetadata;
```

### role\_assignments?

```ts
optional role_assignments: RoleAssignment[];
```
