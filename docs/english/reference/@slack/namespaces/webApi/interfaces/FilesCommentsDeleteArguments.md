[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesCommentsDeleteArguments

# Interface: FilesCommentsDeleteArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:154

## Extends

- `FileArgument`.`TokenOverridable`

## Properties

### file

```ts
file: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:8

#### Description

Encoded file ID.

#### Inherited from

```ts
FileArgument.file
```

***

### id

```ts
id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:156

#### Description

The ID of the comment to delete.

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
