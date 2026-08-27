---
sidebar_label: "MultipleListenerError"
---

[@slack/bolt](../index.md) / MultipleListenerError

# Class: MultipleListenerError

Defined in: [src/errors.ts:156](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L156)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new MultipleListenerError(originals): MultipleListenerError;
```

Defined in: [src/errors.ts:161](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L161)

#### Parameters

##### originals

`Error`[]

#### Returns

`MultipleListenerError`

#### Overrides

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.MultipleListenerError;
```

Defined in: [src/errors.ts:157](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L157)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)

***

### originals

```ts
originals: Error[];
```

Defined in: [src/errors.ts:159](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L159)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`originals`](../interfaces/CodedError.md#originals)
