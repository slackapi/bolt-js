[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FilesGetUploadURLExternalArguments

# Interface: FilesGetUploadURLExternalArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:71

## Extends

- `TokenOverridable`

## Properties

### alt\_text?

```ts
optional alt_text: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:77

#### Description

Description of image for screen-reader.

***

### filename

```ts
filename: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:73

#### Description

Name of the file being uploaded.

***

### length

```ts
length: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:75

#### Description

Size in bytes of the file being uploaded.

***

### snippet\_type?

```ts
optional snippet_type: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/files.d.ts:79

#### Description

Syntax type of the snippet being uploaded. E.g. `python`.

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
