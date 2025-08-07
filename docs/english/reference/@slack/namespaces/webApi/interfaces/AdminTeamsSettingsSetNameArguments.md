[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminTeamsSettingsSetNameArguments

# Interface: AdminTeamsSettingsSetNameArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:35

## Extends

- `TeamID`.`TokenOverridable`

## Properties

### name

```ts
name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:37

#### Description

The new name of the workspace.

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
