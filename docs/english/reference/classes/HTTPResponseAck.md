# Class: HTTPResponseAck

Defined in: [src/receivers/HTTPResponseAck.ts:21](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L21)

## Implements

- [`ResponseAck`](../interfaces/ResponseAck.md)

## Constructors

### Constructor

```ts
new HTTPResponseAck(args): HTTPResponseAck;
```

Defined in: [src/receivers/HTTPResponseAck.ts:45](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L45)

#### Parameters

##### args

`AckArgs`

#### Returns

`HTTPResponseAck`

## Properties

### storedResponse

```ts
storedResponse: any;
```

Defined in: [src/receivers/HTTPResponseAck.ts:43](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L43)

## Methods

### ack()

```ts
ack(): void;
```

Defined in: [src/receivers/HTTPResponseAck.ts:119](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L119)

#### Returns

`void`

***

### bind()

```ts
bind(): AckFn<any>;
```

Defined in: [src/receivers/HTTPResponseAck.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L96)

#### Returns

[`AckFn`](../type-aliases/AckFn.md)\<`any`\>

#### Implementation of

[`ResponseAck`](../interfaces/ResponseAck.md).[`bind`](../interfaces/ResponseAck.md#bind)
