---
sidebar_label: "CustomRouteInitializationError"
---

[@slack/bolt](../index.md) / CustomRouteInitializationError

# Class: CustomRouteInitializationError

Defined in: [src/errors.ts:111](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L111)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new CustomRouteInitializationError(message?): CustomRouteInitializationError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

#### Returns

`CustomRouteInitializationError`

#### Inherited from

```ts
Error.constructor
```

### Constructor

```ts
new CustomRouteInitializationError(message?, options?): CustomRouteInitializationError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

##### options?

`ErrorOptions`

#### Returns

`CustomRouteInitializationError`

#### Inherited from

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.CustomRouteInitializationError;
```

Defined in: [src/errors.ts:112](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L112)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)
