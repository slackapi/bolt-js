[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatDeleteScheduledMessageArguments

# Interface: ChatDeleteScheduledMessageArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:125

## Extends

- `Channel`.`AsUser`.`TokenOverridable`

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
Channel.channel
```

***

### scheduled\_message\_id

```ts
scheduled_message_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:127

#### Description

The `scheduled_message_id` returned from call to [\`chat.scheduleMessage\`](https://api.slack.com/methods/chat.scheduleMessage).

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
