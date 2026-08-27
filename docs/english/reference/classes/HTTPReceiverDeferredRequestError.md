---
sidebar_label: "HTTPReceiverDeferredRequestError"
---

[@slack/bolt](../index.md) / HTTPReceiverDeferredRequestError

# Class: HTTPReceiverDeferredRequestError

Defined in: [src/errors.ts:131](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L131)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new HTTPReceiverDeferredRequestError(
   message, 
   req, 
   res
): HTTPReceiverDeferredRequestError;
```

Defined in: [src/errors.ts:138](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L138)

#### Parameters

##### message

`string`

##### req

  \| `IncomingMessage`
  \| [`BufferedIncomingMessage`](../interfaces/BufferedIncomingMessage.md)

##### res

`ServerResponse`

#### Returns

`HTTPReceiverDeferredRequestError`

#### Overrides

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.HTTPReceiverDeferredRequestError;
```

Defined in: [src/errors.ts:132](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L132)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)

***

### req

```ts
req: 
  | IncomingMessage
  | BufferedIncomingMessage;
```

Defined in: [src/errors.ts:134](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L134)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`req`](../interfaces/CodedError.md#req)

***

### res

```ts
res: ServerResponse;
```

Defined in: [src/errors.ts:136](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L136)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`res`](../interfaces/CodedError.md#res)
