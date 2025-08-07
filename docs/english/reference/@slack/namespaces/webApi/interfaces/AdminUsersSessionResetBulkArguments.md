[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersSessionResetBulkArguments

# Interface: AdminUsersSessionResetBulkArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:82

## Extends

- `UserIDs`.`SessionExpirationTarget`.`TokenOverridable`

## Properties

### mobile\_only?

```ts
optional mobile_only: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:13

#### Description

Only expire mobile sessions. Defaults to `false`.

#### Inherited from

```ts
SessionExpirationTarget.mobile_only
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

***

### user\_ids

```ts
user_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:76

#### Description

List of encoded user IDs.

#### Inherited from

```ts
UserIDs.user_ids
```

***

### web\_only?

```ts
optional web_only: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:15

#### Description

Only expire web sessions. Defaults to `false`.

#### Inherited from

```ts
SessionExpirationTarget.web_only
```
