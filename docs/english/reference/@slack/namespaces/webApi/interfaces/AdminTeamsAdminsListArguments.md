[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminTeamsAdminsListArguments

# Interface: AdminTeamsAdminsListArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:4

## Extends

- `TeamID`.`TokenOverridable`.`CursorPaginationEnabled`

## Properties

### cursor?

```ts
optional cursor: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:13

#### Description

Paginate through collections of data by setting the `cursor` parameter to a `next_cursor` attribute
returned by a previous request's `response_metadata`.
Default value fetches the first "page" of the collection.

#### See

[pagination](https://api.slack.com/docs/pagination) for more detail.

#### Inherited from

```ts
CursorPaginationEnabled.cursor
```

***

### limit?

```ts
optional limit: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:6

#### Description

The maximum number of items to return. Fewer than the requested number of items may be returned,
even if the end of the list hasn't been reached. Must be an integer with a max value of `999`. Default is `100`.

#### Inherited from

```ts
CursorPaginationEnabled.limit
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
