[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsRenameArguments

# Interface: AdminConversationsRenameArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:82

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

### name

```ts
name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:84

#### Description

The new name for the channel.

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
