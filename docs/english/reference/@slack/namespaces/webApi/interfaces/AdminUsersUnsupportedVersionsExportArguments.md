[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersUnsupportedVersionsExportArguments

# Interface: AdminUsersUnsupportedVersionsExportArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:103

## Extends

- `TokenOverridable`

## Properties

### date\_end\_of\_support?

```ts
optional date_end_of_support: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:108

#### Description

Unix timestamp of the date of past or upcoming end of support cycles.
If not provided will include all announced end of support cycles. Defaults to `0`.

***

### date\_sessions\_started?

```ts
optional date_sessions_started: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:113

#### Description

Unix timestamp of a date to start looking for user sessions.
If not provided will start six months ago.

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
