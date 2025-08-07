[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsSetTeamsArguments

# Interface: AdminConversationsSetTeamsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:127

## Extends

- `ChannelID`.`TokenOverridable`

## Properties

### channel\_id

```ts
channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:72

#### Description

Encoded channel ID.

#### Inherited from

```ts
ChannelID.channel_id
```

***

### org\_channel?

```ts
optional org_channel: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:129

#### Description

Set to `true` if channel has to be converted to an org channel. Defaults to `false`.

***

### target\_team\_ids?

```ts
optional target_team_ids: string[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:134

#### Description

A list of workspaces to which the channel should be shared.
Not required if the channel is being shared org-wide.

***

### team\_id?

```ts
optional team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:139

#### Description

The workspace to which the channel belongs.
Omit this argument if the channel is a cross-workspace shared channel.

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
