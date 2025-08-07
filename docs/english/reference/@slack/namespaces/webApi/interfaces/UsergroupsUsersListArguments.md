[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsergroupsUsersListArguments

# Interface: UsergroupsUsersListArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:35

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`

## Properties

### include\_disabled?

```ts
optional include_disabled: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:39

#### Description

Allow results that involve disabled User Groups.

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

### usergroup

```ts
usergroup: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:37

#### Description

The encoded ID of the User Group to list users for.
