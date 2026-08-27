---
sidebar_label: "InvalidCustomPropertyError"
---

[@slack/bolt](../index.md) / InvalidCustomPropertyError

# Class: InvalidCustomPropertyError

Defined in: [src/errors.ts:107](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L107)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new InvalidCustomPropertyError(message?): InvalidCustomPropertyError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

#### Returns

`InvalidCustomPropertyError`

#### Inherited from

```ts
Error.constructor
```

### Constructor

```ts
new InvalidCustomPropertyError(message?, options?): InvalidCustomPropertyError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

##### options?

`ErrorOptions`

#### Returns

`InvalidCustomPropertyError`

#### Inherited from

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.InvalidCustomPropertyError;
```

Defined in: [src/errors.ts:108](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L108)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)
