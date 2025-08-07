[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsergroupsRemoveChannelsArguments

# Interface: AdminUsergroupsRemoveChannelsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:28

## Extends

- `ChannelIDs`.`UsergroupID`.`TokenOverridable`

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
