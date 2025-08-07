[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersSessionGetSettingsArguments

# Interface: AdminUsersSessionGetSettingsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:73

## Extends

- `UserIDs`.`TokenOverridable`

## Properties

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
