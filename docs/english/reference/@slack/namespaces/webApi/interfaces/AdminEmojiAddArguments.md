[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminEmojiAddArguments

# Interface: AdminEmojiAddArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:10

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

***

### url

```ts
url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/emoji.d.ts:15

#### Description

The URL of a file to use as an image for the emoji.
Square images under 128KB and with transparent backgrounds work best.
