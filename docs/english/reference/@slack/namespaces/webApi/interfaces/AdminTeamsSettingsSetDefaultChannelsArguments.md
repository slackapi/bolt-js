[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminTeamsSettingsSetDefaultChannelsArguments

# Interface: AdminTeamsSettingsSetDefaultChannelsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:21

## Extends

- `ChannelIDs`.`TeamID`.`TokenOverridable`

## Properties

### channel\_ids

```ts
channel_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:68

#### Description

An array of channel IDs (must include at least one ID).

#### Inherited from

```ts
ChannelIDs.channel_ids
```

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
