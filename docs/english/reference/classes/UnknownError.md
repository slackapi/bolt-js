# UnknownError

Defined in: [src/errors.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L52)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new UnknownError(original): UnknownError;
```

Defined in: [src/errors.ts:57](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L57)

#### Parameters

##### original

`Error`

#### Returns

`UnknownError`

#### Overrides

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.UnknownError;
```

Defined in: [src/errors.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L53)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)

***

### original

```ts
original: Error;
```

Defined in: [src/errors.ts:55](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L55)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`original`](../interfaces/CodedError.md#original)
