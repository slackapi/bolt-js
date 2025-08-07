[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsRequestSharedInviteApproveArguments

# Interface: ConversationsRequestSharedInviteApproveArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:126

## Extends

- `InviteID`.`Partial`\<`ChannelID`\>.`TokenOverridable`

## Properties

### channel\_id?

```ts
optional channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:72

#### Description

Encoded channel ID.

#### Inherited from

[`ConversationsCanvasesCreateArguments`](ConversationsCanvasesCreateArguments.md).[`channel_id`](ConversationsCanvasesCreateArguments.md#channel_id)

***

### invite\_id

```ts
invite_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:18

#### Description

ID of the invite.

#### Inherited from

```ts
InviteID.invite_id
```

***

### is\_external\_limited?

```ts
optional is_external_limited: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:131

#### Description

Whether the invited team will have post-only permissions in the channel.
Will override the value on the requested invite.

***

### message?

```ts
optional message: object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:133

#### is\_override

```ts
is_override: boolean;
```

##### Description

When `true`, will override the user specified message. Otherwise, `text` will be appended to the
user specified message on the invite request.

#### text

```ts
text: string;
```

##### Description

Text to include along with the email invite.

#### Description

Optional additional messaging to attach to the invite approval message.

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
