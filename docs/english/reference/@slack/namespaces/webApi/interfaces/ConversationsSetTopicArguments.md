[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsSetTopicArguments

# Interface: ConversationsSetTopicArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:161

## Extends

- `Channel`.`TokenOverridable`

## Properties

### channel

```ts
channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:5

#### Description

ID of conversation.

#### Inherited from

```ts
Channel.channel
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

### topic

```ts
topic: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:163

#### Description

The new topic string. Does not support formatting or linkification.
