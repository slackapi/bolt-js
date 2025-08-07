[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminEmojiRemoveArguments

# Interface: AdminEmojiRemoveArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:25

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
