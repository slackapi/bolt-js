[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsLookupArguments

# Interface: AdminConversationsLookupArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:71

## Extends

- `TeamIDs`.`TokenOverridable`.`CursorPaginationEnabled`

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

### last\_message\_activity\_before

```ts
last_message_activity_before: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:76

#### Description

UNIX timestamp to filter by public channels where the most recent message
was sent before this parameter.

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

### max\_member\_count?

```ts
optional max_member_count: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:78

#### Description

Filter by public channels with member count equal to or less than the specified number.

***

### team\_ids

```ts
team_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:56

#### Description

A list of team IDs (must include at least one ID).

#### Inherited from

```ts
TeamIDs.team_ids
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
