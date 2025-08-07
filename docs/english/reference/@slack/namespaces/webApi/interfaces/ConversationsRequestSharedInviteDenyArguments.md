[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsRequestSharedInviteDenyArguments

# Interface: ConversationsRequestSharedInviteDenyArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:143

## Extends

- `InviteID`.`Message`.`TokenOverridable`

## Properties

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

### message?

```ts
optional message: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:30

#### Description

A message to send to the user who requested the invite.

#### Inherited from

```ts
Message.message
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
