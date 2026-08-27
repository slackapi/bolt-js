[@slack/bolt](../index.md) / ReceiverMultipleAckError

# Class: ReceiverMultipleAckError

Defined in: [src/errors.ts:115](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L115)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new ReceiverMultipleAckError(): ReceiverMultipleAckError;
```

Defined in: [src/errors.ts:118](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L118)

#### Returns

`ReceiverMultipleAckError`

#### Overrides

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.ReceiverMultipleAckError;
```

Defined in: [src/errors.ts:116](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L116)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)
