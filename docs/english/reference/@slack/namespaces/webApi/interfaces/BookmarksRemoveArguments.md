[@slack/bolt](../../../../index.md) / [webApi](../index.md) / BookmarksRemoveArguments

# Interface: BookmarksRemoveArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/bookmarks.d.ts:25

## Extends

- `ChannelID`.`ID`.`TokenOverridable`

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
