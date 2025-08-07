[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsergroupsCreateArguments

# Interface: UsergroupsCreateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:7

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`.`UsergroupsIncludeCount`

## Properties

### channels?

```ts
optional channels: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:11

#### Description

A comma separated string of encoded channel IDs for which the User Group uses as a default.

***

### description?

```ts
optional description: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:13

#### Description

A short description of the User Group.

***

### handle?

```ts
optional handle: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:15

#### Description

A mention handle. Must be unique among channels, users and User Groups.

***

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

### name

```ts
name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/usergroups.d.ts:9

#### Description

A name for the User Group. Must be unique among User Groups.

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
