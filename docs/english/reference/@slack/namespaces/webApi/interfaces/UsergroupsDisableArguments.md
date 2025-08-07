[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsergroupsDisableArguments

# Interface: UsergroupsDisableArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:17

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`.`UsergroupsIncludeCount`

## Properties

### include\_count?

```ts
optional include_count: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:5

#### Description

Include the number of users in each User Group.

#### Inherited from

```ts
UsergroupsIncludeCount.include_count
```

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

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:19

#### Description

The encoded ID of the User Group to disable.
