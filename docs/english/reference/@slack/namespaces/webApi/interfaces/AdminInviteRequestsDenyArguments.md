[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminInviteRequestsDenyArguments

# Interface: AdminInviteRequestsDenyArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/inviteRequests.d.ts:12

## Extends

- `InviteRequestID`.`Required`\<`OptionalTeamAssignable`\>.`TokenOverridable`

## Properties

### invite\_request\_id

```ts
invite_request_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/inviteRequests.d.ts:4

#### Description

ID of the request to invite.

#### Inherited from

```ts
InviteRequestID.invite_request_id
```

***

### team\_id

```ts
team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:60

#### Description

If using an org token, `team_id` is required.

#### Inherited from

[`UsersConversationsArguments`](UsersConversationsArguments.md).[`team_id`](UsersConversationsArguments.md#team_id)

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
