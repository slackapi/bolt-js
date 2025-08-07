[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsSetPurposeArguments

# Interface: ConversationsSetPurposeArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:157

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

### purpose

```ts
purpose: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:159

#### Description

A new, specialer purpose.

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
