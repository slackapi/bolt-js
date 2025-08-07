[@slack/bolt](../../../../index.md) / [webApi](../index.md) / DndTeamInfoArguments

# Interface: DndTeamInfoArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/dnd.d.ts:13

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`

## Properties

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

### users

```ts
users: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/dnd.d.ts:15

#### Description

Comma-separated list of users to fetch Do Not Disturb status for.
