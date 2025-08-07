[@slack/bolt](../../../../index.md) / [webApi](../index.md) / MigrationExchangeArguments

# Interface: MigrationExchangeArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/migration.d.ts:2

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`

## Properties

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

### to\_old?

```ts
optional to_old: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/migration.d.ts:6

#### Description

Specify `true` to convert `W` global user IDs to workspace-specific `U` IDs. Defaults to `false`.

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

### users

```ts
users: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/migration.d.ts:4

#### Description

A comma-separated list of user IDs, up to 400 per request.
