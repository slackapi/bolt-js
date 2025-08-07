[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesRemoteAddArguments

# Interface: FilesRemoteAddArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:171

## Extends

- `SharedFile`.`FileType`.`ExternalIDArgument`.`TokenOverridable`

## Properties

### external\_id

```ts
external_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:12

#### Description

Creator defined GUID for the file.

#### Inherited from

```ts
ExternalIDArgument.external_id
```

***

### external\_url

```ts
external_url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:162

#### Description

URL of the remote file.

#### Inherited from

```ts
SharedFile.external_url
```

***

### filetype?

```ts
optional filetype: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:26

#### Description

A file type identifier.

#### See

[File types](https://api.slack.com/types/file#file_types) for a complete list of supported file types.

#### Inherited from

```ts
FileType.filetype
```

***

### indexable\_file\_contents?

```ts
optional indexable_file_contents: Stream | Buffer;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:169

#### Description

A text file (txt, pdf, doc, etc.) containing textual search terms that are used to improve discovery
of the remote file.

#### Inherited from

```ts
SharedFile.indexable_file_contents
```

***

### preview\_image?

```ts
optional preview_image: Stream | Buffer;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:164

#### Description

Preview of the document.

#### Inherited from

```ts
SharedFile.preview_image
```

***

### title

```ts
title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:160

#### Description

Title of the file being shared.

#### Inherited from

```ts
SharedFile.title
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
