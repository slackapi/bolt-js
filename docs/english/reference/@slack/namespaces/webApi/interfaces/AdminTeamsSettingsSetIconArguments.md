[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminTeamsSettingsSetIconArguments

# Interface: AdminTeamsSettingsSetIconArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:31

## Extends

- `TeamID`.`TokenOverridable`

## Properties

### image\_url

```ts
image_url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:33

#### Description

Image URL for the icon.

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
