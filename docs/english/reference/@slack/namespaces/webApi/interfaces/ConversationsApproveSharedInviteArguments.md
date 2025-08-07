[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsApproveSharedInviteArguments

# Interface: ConversationsApproveSharedInviteArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:50

## Extends

- `InviteID`.`TargetTeam`.`TokenOverridable`

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

### target\_team?

```ts
optional target_team: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:64

#### Description

The team or enterprise id of the other party.

#### Inherited from

```ts
TargetTeam.target_team
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
