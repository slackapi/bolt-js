[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminEmojiAddAliasArguments

# Interface: AdminEmojiAddAliasArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:17

## Extends

- `Name`.`TokenOverridable`

## Properties

### alias\_for

```ts
alias_for: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:22

#### Description

Name of the emoji for which the alias is being made.
Any wrapping whitespace or colons will be automatically trimmed.

***

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
