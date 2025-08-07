[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsDisconnectSharedArguments

# Interface: AdminConversationsDisconnectSharedArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:58

## Extends

- `ChannelID`.`TokenOverridable`

## Properties

### channel\_id

```ts
channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:72

#### Description

Encoded channel ID.

#### Inherited from

```ts
ChannelID.channel_id
```

***

### leaving\_team\_ids?

```ts
optional leaving_team_ids: string[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:60

#### Description

Team IDs getting removed from the channel, optional if there are only two teams in the channel.

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
