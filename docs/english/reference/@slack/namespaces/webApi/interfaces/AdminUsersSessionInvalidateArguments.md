[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersSessionInvalidateArguments

# Interface: AdminUsersSessionInvalidateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:75

## Extends

- `TeamID`.`TokenOverridable`

## Properties

### session\_id

```ts
session_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:77

#### Description

ID of the session to invalidate.

***

### team\_id

```ts
team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:52

#### Description

The encoded team ID.

#### Inherited from

```ts
TeamID.team_id
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
