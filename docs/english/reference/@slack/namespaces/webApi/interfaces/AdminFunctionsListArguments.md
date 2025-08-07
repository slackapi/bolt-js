[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminFunctionsListArguments

# Interface: AdminFunctionsListArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:2

## Extends

- `TokenOverridable`.`CursorPaginationEnabled`

## Properties

### app\_ids

```ts
app_ids: string[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:4

#### Description

Array of app IDs to get functions for; max 50.

***

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

### team\_id?

```ts
optional team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:6

#### Description

The team context to retrieve functions from.

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
