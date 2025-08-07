[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsBulkDeleteArguments

# Interface: AdminConversationsBulkDeleteArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:19

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
