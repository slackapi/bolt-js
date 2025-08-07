[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersSetAdminArguments

# Interface: AdminUsersSetAdminArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:93

## Extends

- `TeamID`.`UserID`.`TokenOverridable`

## Properties

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

***

### user\_id

```ts
user_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:80

#### Description

Encoded user ID.

#### Inherited from

```ts
UserID.user_id
```
