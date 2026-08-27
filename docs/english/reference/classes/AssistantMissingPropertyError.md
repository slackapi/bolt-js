[@slack/bolt](../index.md) / AssistantMissingPropertyError

# Class: AssistantMissingPropertyError

Defined in: [src/errors.ts:80](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L80)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new AssistantMissingPropertyError(message?): AssistantMissingPropertyError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

#### Returns

`AssistantMissingPropertyError`

#### Inherited from

```ts
Error.constructor
```

### Constructor

```ts
new AssistantMissingPropertyError(message?, options?): AssistantMissingPropertyError;
```

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1081

#### Parameters

##### message?

`string`

##### options?

`ErrorOptions`

#### Returns

`AssistantMissingPropertyError`

#### Inherited from

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.AssistantMissingPropertyError;
```

Defined in: [src/errors.ts:81](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L81)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)
