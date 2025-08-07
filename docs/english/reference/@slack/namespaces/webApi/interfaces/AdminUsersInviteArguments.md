[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersInviteArguments

# Interface: AdminUsersInviteArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:39

## Extends

- `ChannelIDs`.`TeamID`.`IsRestricted`.`IsUltraRestricted`.`TokenOverridable`

## Properties

### channel\_ids

```ts
channel_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:68

#### Description

An array of channel IDs (must include at least one ID).

#### Inherited from

```ts
ChannelIDs.channel_ids
```

***

### custom\_message?

```ts
optional custom_message: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:43

#### Description

An optional message to send to the user in the invite email.

***

### email

```ts
email: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:41

#### Description

The email address of the person to invite.

***

### email\_password\_policy\_enabled?

```ts
optional email_password_policy_enabled: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:48

#### Description

Allow invited user to sign in via email and password. Only available for Enterprise Grid teams via
admin invite.

***

### guest\_expiration\_ts?

```ts
optional guest_expiration_ts: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:53

#### Description

Timestamp when guest account should be disabled. Only include this timestamp if you are inviting a
guest user and you want their account to expire on a certain date.

***

### is\_restricted?

```ts
optional is_restricted: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:5

#### Description

Set to `true` if user should be added to the workspace as a guest.

#### Inherited from

```ts
IsRestricted.is_restricted
```

***

### is\_ultra\_restricted?

```ts
optional is_ultra_restricted: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:9

#### Description

Set to `true` if user should be added to the workspace as a guest.

#### Inherited from

```ts
IsUltraRestricted.is_ultra_restricted
```

***

### real\_name?

```ts
optional real_name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:55

#### Description

Full name of the user.

***

### resend?

```ts
optional resend: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:60

#### Description

Allow this invite to be resent in the future if a user has not signed up yet.
Resending can only be done via the UI and has no expiration. Defaults to `false`.

***

### team\_id

```ts
team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:52

#### Description

The encoded team ID.

#### Inherited from

```ts
TeamID.team_id
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
