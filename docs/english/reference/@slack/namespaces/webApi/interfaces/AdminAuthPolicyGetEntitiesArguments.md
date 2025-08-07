[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminAuthPolicyGetEntitiesArguments

# Interface: AdminAuthPolicyGetEntitiesArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/auth.d.ts:16

## Extends

- `Partial`\<`EntityType`\>.`PolicyName`.`TokenOverridable`.`CursorPaginationEnabled`

## Properties

### cursor?

```ts
optional cursor: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:13

#### Description

Paginate through collections of data by setting the `cursor` parameter to a `next_cursor` attribute
returned by a previous request's `response_metadata`.
Default value fetches the first "page" of the collection.

#### See

[pagination](https://api.slack.com/docs/pagination) for more detail.

#### Inherited from

```ts
CursorPaginationEnabled.cursor
```

***

### entity\_type?

```ts
optional entity_type: "USER";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/auth.d.ts:8

#### Description

The type of entity interacting with the policy.

#### Inherited from

[`AdminAuthPolicyAssignEntitiesArguments`](AdminAuthPolicyAssignEntitiesArguments.md).[`entity_type`](AdminAuthPolicyAssignEntitiesArguments.md#entity_type)

***

### limit?

```ts
optional limit: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:6

#### Description

The maximum number of items to return. Fewer than the requested number of items may be returned,
even if the end of the list hasn't been reached. Must be an integer with a max value of `999`. Default is `100`.

#### Inherited from

```ts
CursorPaginationEnabled.limit
```

***

### policy\_name

```ts
policy_name: "email_password";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/auth.d.ts:12

#### Description

The name of the policy.

#### Inherited from

```ts
PolicyName.policy_name
```

***

### token?

```ts
optional token: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:37

#### Description

Overridable authentication token bearing required scopes.

#### Inherited from

```ts
TokenOverridable.token
```
