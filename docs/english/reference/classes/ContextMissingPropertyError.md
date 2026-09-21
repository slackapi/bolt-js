# ContextMissingPropertyError

Defined in: [src/errors.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L96)

## Extends

- `Error`

## Implements

- [`CodedError`](../interfaces/CodedError.md)

## Constructors

### Constructor

```ts
new ContextMissingPropertyError(missingProperty, message): ContextMissingPropertyError;
```

Defined in: [src/errors.ts:101](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L101)

#### Parameters

##### missingProperty

`string`

##### message

`string`

#### Returns

`ContextMissingPropertyError`

#### Overrides

```ts
Error.constructor
```

## Properties

### code

```ts
code: ErrorCode = ErrorCode.ContextMissingPropertyError;
```

Defined in: [src/errors.ts:97](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L97)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`code`](../interfaces/CodedError.md#code)

***

### missingProperty

```ts
missingProperty: string;
```

Defined in: [src/errors.ts:99](https://github.com/slackapi/bolt-js/blob/main/src/errors.ts#L99)

#### Implementation of

[`CodedError`](../interfaces/CodedError.md).[`missingProperty`](../interfaces/CodedError.md#missingproperty)
