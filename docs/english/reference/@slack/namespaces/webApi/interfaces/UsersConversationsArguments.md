[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsersConversationsArguments

# Interface: UsersConversationsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:7

## Extends

- `TokenOverridable`.`CursorPaginationEnabled`.`OptionalTeamAssignable`

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

### exclude\_archived?

```ts
optional exclude_archived: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:9

#### Description

Set to `true` to exclude archived channels from the list. Default is `false`.

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

### types?

```ts
optional types: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:14

#### Description

Mix and match channel types by providing a comma-separated list of any combination of
`public_channel`, `private_channel`, `mpim` and `im`. Defaults to `public_channel`.

***

### user?

```ts
optional user: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:19

#### Description

Browse conversations by a specific user ID's membership.
Non-public channels are restricted to those where the calling user shares membership.
