[@slack/bolt](../../../../index.md) / [webApi](../index.md) / BookmarksEditArguments

# Interface: BookmarksEditArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:21

## Extends

- `ChannelID`.`ID`.`Partial`\<`BookmarkFields`\>.`TokenOverridable`

## Properties

### bookmark\_id

```ts
bookmark_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:3

#### Inherited from

```ts
ID.bookmark_id
```

***

### channel\_id

```ts
channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:72

#### Description

Encoded channel ID.

#### Inherited from

```ts
ChannelID.channel_id
```

***

### emoji?

```ts
optional emoji: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:11

#### Description

Emoji tag to apply to the bookmark.

#### Inherited from

[`BookmarksAddArguments`](BookmarksAddArguments.md).[`emoji`](BookmarksAddArguments.md#emoji)

***

### link?

```ts
optional link: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:9

#### Description

Link to bookmark.

#### Inherited from

[`BookmarksAddArguments`](BookmarksAddArguments.md).[`link`](BookmarksAddArguments.md#link)

***

### title?

```ts
optional title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:7

#### Description

Title for the bookmark.

#### Inherited from

[`BookmarksAddArguments`](BookmarksAddArguments.md).[`title`](BookmarksAddArguments.md#title)

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
