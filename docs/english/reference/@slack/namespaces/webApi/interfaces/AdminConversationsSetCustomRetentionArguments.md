[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsSetCustomRetentionArguments

# Interface: AdminConversationsSetCustomRetentionArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:123

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

### duration\_days

```ts
duration_days: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:125

#### Description

The message retention duration in days to set for this conversation.

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
