# Class: RespondError

Defined in: [src/errors.ts:145](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L145)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new RespondError(message, statusCode): RespondError;
```

Defined in: [src/errors.ts:150](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L150)

#### Parameters

##### message

`string`

##### statusCode

`number`

#### Returns

`RespondError`

#### Overrides

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.RespondError;
```

Defined in: [src/errors.ts:146](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L146)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)

***

### statusCode

```ts
statusCode: number;
```

Defined in: [src/errors.ts:148](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L148)
