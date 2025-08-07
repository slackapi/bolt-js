[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsRepliesArguments

# Interface: ConversationsRepliesArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:124

## Extends

- `MessageSpecifier`.`IncludeAllMetadata`.`TokenOverridable`.`CursorPaginationEnabled`.`TimelinePaginationEnabled`

## Properties

### channel

```ts
channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:5

#### Description

ID of conversation.

#### Inherited from

```ts
MessageSpecifier.channel
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

### include\_all\_metadata?

```ts
optional include_all_metadata: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:14

#### Description

Return all metadata associated with messages. Defaults to `false`.

#### Inherited from

```ts
IncludeAllMetadata.include_all_metadata
```

***

### inclusive?

```ts
optional inclusive: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:24

#### Description

Include messages with `oldest` or `latest` timestamps in results.
Ignored unless either timestamp is specified. Defaults to `false`.

#### Inherited from

```ts
TimelinePaginationEnabled.inclusive
```

***

### latest?

```ts
optional latest: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:19

#### Description

Only messages before this Unix timestamp will be included in results.

#### Inherited from

```ts
TimelinePaginationEnabled.latest
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

### oldest?

```ts
optional oldest: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:17

#### Description

Only messages after this Unix timestamp will be included in results.

#### Inherited from

```ts
TimelinePaginationEnabled.oldest
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

### ts

```ts
ts: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:26

#### Description

Unique identifier of message.

#### Inherited from

```ts
MessageSpecifier.ts
```
