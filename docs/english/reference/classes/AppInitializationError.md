[@slack/bolt](../index.md) / AppInitializationError

# Class: AppInitializationError

Defined in: [src/errors.ts:72](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L72)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new AppInitializationError(message?): AppInitializationError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

#### Returns

`AppInitializationError`

#### Inherited from

```ts
Error.constructor
```

### Constructor

```ts
new AppInitializationError(message?, options?): AppInitializationError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

##### options?

`ErrorOptions`

#### Returns

`AppInitializationError`

#### Inherited from

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.AppInitializationError;
```

Defined in: [src/errors.ts:73](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L73)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)
