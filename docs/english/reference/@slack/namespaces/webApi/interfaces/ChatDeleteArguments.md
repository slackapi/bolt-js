[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatDeleteArguments

# Interface: ChatDeleteArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:123

## Extends

- `ChannelAndTS`.`AsUser`.`TokenOverridable`

## Properties

### as\_user?

```ts
optional as_user: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:23

#### Description

Pass `true` to act as the authed user with [\`chat:write:user\` scope](https://api.slack.com/scopes/chat:write:user).
Bot users in this context are considered authed users. If unused or `false`, the message will be acted upon with
[\`chat:write:bot\` scope](https://api.slack.com/scopes/chat:write:bot).

#### Inherited from

```ts
AsUser.as_user
```

***

### channel

```ts
channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:7

#### Description

Channel ID for the message.

#### Inherited from

```ts
ChannelAndTS.channel
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

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:11

#### Description

Timestamp of the message.

#### Inherited from

```ts
ChannelAndTS.ts
```
