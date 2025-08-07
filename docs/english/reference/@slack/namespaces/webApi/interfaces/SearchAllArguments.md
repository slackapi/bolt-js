[@slack/bolt](../../../../index.md) / [webApi](../index.md) / SearchAllArguments

# Interface: SearchAllArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/search.d.ts:13

## Extends

- `TokenOverridable`.`TraditionalPagingEnabled`.`Searchable`

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

### highlight?

```ts
optional highlight: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/search.d.ts:9

#### Description

Set to `true` to enable query highlight markers. Defaults to `false`.

#### See

[\`search.messages\` Usage info](https://api.slack.com/methods/search.messages#markdown) for details.

#### Inherited from

```ts
Searchable.highlight
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

### query

```ts
query: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/search.d.ts:4

#### Description

Search query.

#### Inherited from

```ts
Searchable.query
```

***

### sort?

```ts
optional sort: "score" | "timestamp";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/search.d.ts:11

#### Description

Return matches sorted by either `score` or `timestamp`. Defaults to `score`.

#### Inherited from

```ts
Searchable.sort
```

***

### sort\_dir?

```ts
optional sort_dir: "asc" | "desc";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:106

#### Description

Change sort direction to ascending (`asc`) or descending (`desc`). Defaults to `desc`.

#### Inherited from

```ts
Searchable.sort_dir
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
Searchable.team_id
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
