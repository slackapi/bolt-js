[@slack/bolt](../../../../index.md) / [webApi](../index.md) / BookmarksAddArguments

# Interface: BookmarksAddArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:13

## Extends

- `ChannelID`.`BookmarkFields`.`TokenOverridable`

## Properties

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

```ts
BookmarkFields.emoji
```

***

### entity\_id?

```ts
optional entity_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:17

#### Description

ID of the entity being bookmarked. Only applies to message and file types.

***

### link

```ts
link: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:9

#### Description

Link to bookmark.

#### Inherited from

```ts
BookmarkFields.link
```

***

### parent\_id?

```ts
optional parent_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:19

#### Description

ID of this bookmark's parent.

***

### title

```ts
title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:7

#### Description

Title for the bookmark.

#### Inherited from

```ts
BookmarkFields.title
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

### type

```ts
type: "link";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:15

#### Description

Type of the bookmark. Only `link` is supported at the moment.
