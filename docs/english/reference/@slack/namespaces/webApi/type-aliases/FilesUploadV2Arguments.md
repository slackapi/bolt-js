[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesUploadV2Arguments

# Type Alias: FilesUploadV2Arguments

```ts
type FilesUploadV2Arguments = TokenOverridable & 
  | FileUploadV2
  | Omit<FileUploadV2, "file" | "content"> & FilesUploadV2ArgumentsMultipleFiles;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:149
