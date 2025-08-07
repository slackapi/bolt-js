[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesRemoteListArguments

# Interface: FilesRemoteListArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:179

## Extends

- `TokenOverridable`.`CursorPaginationEnabled`

## Properties

### channel?

```ts
optional channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:181

#### Description

Filter files appearing in a specific channel, indicated by its ID.

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

### ts\_from?

```ts
optional ts_from: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:183

#### Description

Filter files created after this timestamp (inclusive).

***

### ts\_to?

```ts
optional ts_to: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:185

#### Description

Filter files created before this timestamp (inclusive).
