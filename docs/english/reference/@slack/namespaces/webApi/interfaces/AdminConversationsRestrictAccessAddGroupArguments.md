[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsRestrictAccessAddGroupArguments

# Interface: AdminConversationsRestrictAccessAddGroupArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:86

## Extends

- `ChannelID`.`GroupID`.`RestrictAccessTeamID`.`TokenOverridable`

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

### group\_id

```ts
group_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:6

#### Description

The [IDP Group](https://slack.com/help/articles/115001435788-Connect-identity-provider-groups-to-your-Enterprise-Grid-org) ID.

#### Inherited from

```ts
GroupID.group_id
```

***

### team\_id?

```ts
optional team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:13

#### Description

The workspace where the channel exists. This argument is required for channels only tied to
one workspace, and optional for channels that are shared across an organization.

#### Inherited from

```ts
RestrictAccessTeamID.team_id
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
