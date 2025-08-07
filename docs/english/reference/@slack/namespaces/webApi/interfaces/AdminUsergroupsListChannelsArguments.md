[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsergroupsListChannelsArguments

# Interface: AdminUsergroupsListChannelsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:24

## Extends

- `UsergroupID`.`OptionalTeamAssignable`.`TokenOverridable`

## Properties

### include\_num\_members?

```ts
optional include_num_members: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:26

#### Description

Flag to include or exclude the count of members per channel.

***

### team\_id?

```ts
optional team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:60

#### Description

If using an org token, `team_id` is required.

#### Inherited from

```ts
OptionalTeamAssignable.team_id
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

### usergroup\_id

```ts
usergroup_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:8

#### Description

ID of the IDP group to list/manage channels for.

#### Inherited from

```ts
UsergroupID.usergroup_id
```
