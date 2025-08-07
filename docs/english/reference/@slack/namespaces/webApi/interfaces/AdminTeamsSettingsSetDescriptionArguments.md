[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminTeamsSettingsSetDescriptionArguments

# Interface: AdminTeamsSettingsSetDescriptionArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:23

## Extends

- `TeamID`.`TokenOverridable`

## Properties

### description

```ts
description: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:25

#### Description

The new description for the workspace.

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
