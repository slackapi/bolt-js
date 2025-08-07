[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminTeamsSettingsSetDiscoverabilityArguments

# Interface: AdminTeamsSettingsSetDiscoverabilityArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:27

## Extends

- `TeamID`.`TokenOverridable`

## Properties

### discoverability

```ts
discoverability: TeamDiscoverability;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:29

#### Description

This workspace's discovery setting.

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
