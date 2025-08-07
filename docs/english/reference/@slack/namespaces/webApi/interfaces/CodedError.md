[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CodedError

# Interface: CodedError

Defined in: node\_modules/@slack/web-api/dist/errors.d.ts:7

All errors produced by this package adhere to this interface

## Extends

- `ErrnoException`

## Extended by

- [`WebAPIPlatformError`](WebAPIPlatformError.md)
- [`WebAPIRequestError`](WebAPIRequestError.md)
- [`WebAPIHTTPError`](WebAPIHTTPError.md)
- [`WebAPIRateLimitedError`](WebAPIRateLimitedError.md)

## Properties

### cause?

```ts
optional cause: unknown;
```

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

```ts
NodeJS.ErrnoException.cause
```

***

### code

```ts
code: ErrorCode;
```

Defined in: node\_modules/@slack/web-api/dist/errors.d.ts:8

#### Overrides

```ts
NodeJS.ErrnoException.code
```

***

### errno?

```ts
optional errno: number;
```

Defined in: node\_modules/@types/node/globals.d.ts:196

#### Inherited from

```ts
NodeJS.ErrnoException.errno
```

***

### message

```ts
message: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

```ts
NodeJS.ErrnoException.message
```

***

### name

```ts
name: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1075

#### Inherited from

```ts
NodeJS.ErrnoException.name
```

***

### path?

```ts
optional path: string;
```

Defined in: node\_modules/@types/node/globals.d.ts:198

#### Inherited from

```ts
NodeJS.ErrnoException.path
```

***

### stack?

```ts
optional stack: string;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

```ts
NodeJS.ErrnoException.stack
```

***

### syscall?

```ts
optional syscall: string;
```

Defined in: node\_modules/@types/node/globals.d.ts:199

#### Inherited from

```ts
NodeJS.ErrnoException.syscall
```
