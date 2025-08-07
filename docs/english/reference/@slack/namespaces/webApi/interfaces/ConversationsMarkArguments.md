[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsMarkArguments

# Interface: ConversationsMarkArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:107

## Extends

- `MessageSpecifier`.`TokenOverridable`

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
MessageSpecifier.channel
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

### ts

```ts
ts: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:26

#### Description

Unique identifier of message.

#### Inherited from

```ts
MessageSpecifier.ts
```
