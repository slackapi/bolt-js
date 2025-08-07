[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatMeMessageArguments

# Interface: ChatMeMessageArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:131

## Extends

- `ChannelAndText`.`TokenOverridable`

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
ChannelAndText.channel
```

***

### text

```ts
text: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:41

#### Description

Text of the message. If used in conjunction with `blocks` or `attachments`, `text` will be used
as fallback text for notifications only.

#### Inherited from

```ts
ChannelAndText.text
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
