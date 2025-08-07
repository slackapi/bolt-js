[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesListArguments

# Interface: FilesListArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:83

## Extends

- `TokenOverridable`.`TraditionalPagingEnabled`.`OptionalTeamAssignable`

## Properties

### channel?

```ts
optional channel: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:85

#### Description

Filter files appearing in a specific channel, indicated by its ID.

***

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

### show\_files\_hidden\_by\_limit?

```ts
optional show_files_hidden_by_limit: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:90

#### Description

Show truncated file info for files hidden due to being too old, and the team who owns the file
being over the file limit.

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

### ts\_from?

```ts
optional ts_from: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:92

#### Description

Filter files created after this timestamp (inclusive).

***

### ts\_to?

```ts
optional ts_to: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:94

#### Description

Filter files created before this timestamp (inclusive).

***

### types?

```ts
optional types: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:100

#### Description

Filter files by type. Pass multiple values for `types` argument by comma-seperating the values.
The default value is `all`, which does not filter the list.
Available types are `all`, `spaces`, `snippets`, `images`, `gdocs`, `zips` and `pdfs`.

***

### user?

```ts
optional user: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:102

#### Description

Filter files created by a single user.
