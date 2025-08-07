[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsBulkMoveArguments

# Interface: AdminConversationsBulkMoveArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:21

## Extends

- `ChannelIDs`.`TokenOverridable`

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

### target\_team\_id

```ts
target_team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:23

#### Description

Target team ID to move channels to.

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
