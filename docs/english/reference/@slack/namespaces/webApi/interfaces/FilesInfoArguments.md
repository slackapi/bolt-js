[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesInfoArguments

# Interface: FilesInfoArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:81

## Extends

- `FileArgument`.`TokenOverridable`.`CursorPaginationEnabled`.`TraditionalPagingEnabled`

## Properties

### count?

```ts
optional count: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:28

#### Description

Number of items to return per page. Defaults to `20`

#### Inherited from

```ts
TraditionalPagingEnabled.count
```

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

### file

```ts
file: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:8

#### Description

Encoded file ID.

#### Inherited from

```ts
FileArgument.file
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

### page?

```ts
optional page: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:30

#### Description

Page number of results to return. Defaults to `1`.

#### Inherited from

```ts
TraditionalPagingEnabled.page
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
