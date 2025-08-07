[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminEmojiRenameArguments

# Interface: AdminEmojiRenameArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:27

## Extends

- `Name`.`TokenOverridable`

## Properties

### name

```ts
name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:8

#### Description

The name of the emoji. Colons (:myemoji:) around the value are not required,
although they may be included.

#### Inherited from

```ts
Name.name
```

***

### new\_name

```ts
new_name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:29

#### Description

The new name of the emoji.

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
