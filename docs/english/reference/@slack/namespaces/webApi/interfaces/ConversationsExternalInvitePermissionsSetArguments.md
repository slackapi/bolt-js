[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsExternalInvitePermissionsSetArguments

# Interface: ConversationsExternalInvitePermissionsSetArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:62

## Extends

- `Channel`.`Required`\<`TargetTeam`\>.`TokenOverridable`

## Properties

### action

```ts
action: "downgrade" | "upgrade";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:64

#### Description

The type of action be taken: `upgrade` or `downgrade`.

***

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

### target\_team

```ts
target_team: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:64

#### Description

The team or enterprise id of the other party.

#### Inherited from

[`ConversationsApproveSharedInviteArguments`](ConversationsApproveSharedInviteArguments.md).[`target_team`](ConversationsApproveSharedInviteArguments.md#target_team)

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
