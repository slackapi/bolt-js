[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersSetExpirationArguments

# Interface: AdminUsersSetExpirationArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:95

## Extends

- `UserID`.`TokenOverridable`.`OptionalTeamAssignable`

## Properties

### expiration\_ts

```ts
expiration_ts: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:97

#### Description

Epoch timestamp in seconds when guest account should be disabled.

***

### team\_id?

```ts
optional team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:60

#### Description

If using an org token, `team_id` is required.

#### Inherited from

```ts
OptionalTeamAssignable.team_id
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
