[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsergroupsAddTeamsArguments

# Interface: AdminUsergroupsAddTeamsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:12

## Extends

- `UsergroupID`.`TokenOverridable`

## Properties

### auto\_provision?

```ts
optional auto_provision: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:22

#### Description

When `true`, this method automatically creates new workspace accounts for the IDP group members.
Defaults to `false`.

***

### team\_ids

```ts
team_ids: string | string[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/usergroups.d.ts:17

#### Description

One or more encoded team (workspace) IDs.
Each workspace MUST belong to the organization associated with the token.

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
