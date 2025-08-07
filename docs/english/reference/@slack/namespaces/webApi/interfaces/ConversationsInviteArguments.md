[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsInviteArguments

# Interface: ConversationsInviteArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:74

## Extends

- `Channel`.`Users`.`TokenOverridable`

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

### force?

```ts
optional force: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:79

#### Description

When set to `true` and multiple user IDs are provided, continue inviting the valid ones while
disregarding invalid IDs. Defaults to `false`.

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

### users

```ts
users: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:39

#### Description

A comma separated list of user IDs. Up to 1000 users may be listed.

#### Inherited from

```ts
Users.users
```
