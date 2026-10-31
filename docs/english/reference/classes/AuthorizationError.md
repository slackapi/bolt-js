# AuthorizationError

Defined in: [src/errors.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L84)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new AuthorizationError(message, original): AuthorizationError;
```

Defined in: [src/errors.ts:89](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L89)

#### Parameters

##### message

`string`

##### original

`Error`

#### Returns

`AuthorizationError`

#### Overrides

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.AuthorizationError;
```

Defined in: [src/errors.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L85)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)

***

### original

```ts
original: Error;
```

Defined in: [src/errors.ts:87](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L87)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`original`](../interfaces/CodedError.md#original)
