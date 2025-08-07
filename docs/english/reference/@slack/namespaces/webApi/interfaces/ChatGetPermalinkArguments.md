[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatGetPermalinkArguments

# Interface: ChatGetPermalinkArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:129

## Extends

- `ChannelAndMessageTS`.`TokenOverridable`

## Properties

### channel

```ts
channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:7

#### Description

Channel ID for the message.

#### Inherited from

```ts
ChannelAndMessageTS.channel
```

***

### message\_ts

```ts
message_ts: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:15

#### Description

Timestamp of the message.

#### Inherited from

```ts
ChannelAndMessageTS.message_ts
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
