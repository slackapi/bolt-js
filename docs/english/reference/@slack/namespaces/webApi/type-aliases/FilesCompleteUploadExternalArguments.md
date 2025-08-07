[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesCompleteUploadExternalArguments

# Type Alias: FilesCompleteUploadExternalArguments

```ts
type FilesCompleteUploadExternalArguments = FileDestinationArgument & TokenOverridable & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:54

## Type declaration

### blocks?

```ts
optional blocks: (
  | KnownBlock
  | Block)[];
```

#### Description

An array of structured rich text blocks. If the `initial_comment` field is provided, the `blocks` field is ignored.

#### Example

```ts
[{"type": "section", "text": {"type": "plain_text", "text": "Hello world"}}]
```

#### See

[https://api.slack.com/reference/block-kit/blocks](https://api.slack.com/reference/block-kit/blocks)

### files

```ts
files: [FileUploadComplete, ...FileUploadComplete[]];
```

#### Description

Array of file IDs and their corresponding (optional) titles.

#### Example

```ts
[{"id":"F044GKUHN9Z", "title":"slack-test"}]
```

### initial\_comment?

```ts
optional initial_comment: string;
```

#### Description

The message text introducing the file in the specified channel.
