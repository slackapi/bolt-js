[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsergroupsUpdateArguments

# Interface: UsergroupsUpdateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:31

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`.`Partial`\<[`UsergroupsCreateArguments`](UsergroupsCreateArguments.md)\>

## Properties

### channels?

```ts
optional channels: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:11

#### Description

A comma separated string of encoded channel IDs for which the User Group uses as a default.

#### Inherited from

[`UsergroupsCreateArguments`](UsergroupsCreateArguments.md).[`channels`](UsergroupsCreateArguments.md#channels)

***

### description?

```ts
optional description: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:13

#### Description

A short description of the User Group.

#### Inherited from

[`UsergroupsCreateArguments`](UsergroupsCreateArguments.md).[`description`](UsergroupsCreateArguments.md#description)

***

### handle?

```ts
optional handle: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:15

#### Description

A mention handle. Must be unique among channels, users and User Groups.

#### Inherited from

[`UsergroupsCreateArguments`](UsergroupsCreateArguments.md).[`handle`](UsergroupsCreateArguments.md#handle)

***

### include\_count?

```ts
optional include_count: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:5

#### Description

Include the number of users in each User Group.

#### Inherited from

[`UsergroupsCreateArguments`](UsergroupsCreateArguments.md).[`include_count`](UsergroupsCreateArguments.md#include_count)

***

### name?

```ts
optional name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:9

#### Description

A name for the User Group. Must be unique among User Groups.

#### Inherited from

[`UsergroupsCreateArguments`](UsergroupsCreateArguments.md).[`name`](UsergroupsCreateArguments.md#name)

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

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:33

#### Description

The encoded ID of the User Group to update.
