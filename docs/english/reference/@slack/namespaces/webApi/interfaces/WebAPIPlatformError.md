[@slack/bolt](../../../../index.md) / [webApi](../index.md) / WebAPIPlatformError

# Interface: WebAPIPlatformError

Defined in: node\_modules/@slack/web-api/dist/errors.d.ts:29

All errors produced by this package adhere to this interface

## Extends

- [`CodedError`](CodedError.md)

## Properties

### cause?

```ts
optional cause: unknown;
```

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

[`CodedError`](CodedError.md).[`cause`](CodedError.md#cause)

***

### code

```ts
code: PlatformError;
```

Defined in: node\_modules/@slack/web-api/dist/errors.d.ts:30

#### Overrides

[`CodedError`](CodedError.md).[`code`](CodedError.md#code)

***

### data

```ts
data: WebAPICallResult & object;
```

Defined in: node\_modules/@slack/web-api/dist/errors.d.ts:31

#### Type declaration

##### error

```ts
error: string;
```

***

### errno?

```ts
optional errno: number;
```

Defined in: node\_modules/@types/node/globals.d.ts:196

#### Inherited from

[`CodedError`](CodedError.md).[`errno`](CodedError.md#errno)

***

### message

```ts
message: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

[`CodedError`](CodedError.md).[`message`](CodedError.md#message)

***

### name

```ts
name: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

[`CodedError`](CodedError.md).[`name`](CodedError.md#name)

***

### path?

```ts
optional path: string;
```

Defined in: node\_modules/@types/node/globals.d.ts:198

#### Inherited from

[`CodedError`](CodedError.md).[`path`](CodedError.md#path)

***

### stack?

```ts
optional stack: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

[`CodedError`](CodedError.md).[`stack`](CodedError.md#stack)

***

### syscall?

```ts
optional syscall: string;
```

Defined in: node\_modules/@types/node/globals.d.ts:199

#### Inherited from

[`CodedError`](CodedError.md).[`syscall`](CodedError.md#syscall)
