[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsRenameArguments

# Interface: ConversationsRenameArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:120

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

### name

```ts
name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:122

#### Description

New name for conversation.

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
