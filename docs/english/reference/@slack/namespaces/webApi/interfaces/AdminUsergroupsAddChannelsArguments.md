[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsergroupsAddChannelsArguments

# Interface: AdminUsergroupsAddChannelsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:10

## Extends

- `ChannelIDs`.`UsergroupID`.`OptionalTeamAssignable`.`TokenOverridable`

## Properties

### channel\_ids

```ts
channel_ids: string | string[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:4

#### Description

One or more encoded channel IDs.

#### Inherited from

```ts
ChannelIDs.channel_ids
```

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

### usergroup\_id

```ts
usergroup_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:8

#### Description

ID of the IDP group to list/manage channels for.

#### Inherited from

```ts
UsergroupID.usergroup_id
```
