[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersAssignArguments

# Interface: AdminUsersAssignArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:37

## Extends

- `TeamID`.`UserID`.`Partial`\<`ChannelIDs`\>.`IsRestricted`.`IsUltraRestricted`.`TokenOverridable`

## Properties

### channel\_ids?

```ts
optional channel_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:68

#### Description

An array of channel IDs (must include at least one ID).

#### Inherited from

[`AdminConversationsBulkArchiveArguments`](AdminConversationsBulkArchiveArguments.md).[`channel_ids`](AdminConversationsBulkArchiveArguments.md#channel_ids)

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

***

### user\_id

```ts
user_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:80

#### Description

Encoded user ID.

#### Inherited from

```ts
UserID.user_id
```
