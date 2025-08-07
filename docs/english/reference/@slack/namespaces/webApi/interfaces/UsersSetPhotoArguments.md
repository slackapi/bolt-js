[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsersSetPhotoArguments

# Interface: UsersSetPhotoArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:39

## Extends

- `TokenOverridable`

## Properties

### crop\_w?

```ts
optional crop_w: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:43

#### Description

Width/height of crop box (always square).

***

### crop\_x?

```ts
optional crop_x: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:45

#### Description

X coordinate of top-left corner of crop box.

***

### crop\_y?

```ts
optional crop_y: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:47

#### Description

Y coordinate of top-left corner of crop box.

***

### image

```ts
image: Stream | Buffer;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:41

#### Description

Image file contents.

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
