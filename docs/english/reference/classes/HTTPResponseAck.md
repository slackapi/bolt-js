[@slack/bolt](../index.md) / HTTPResponseAck

# Class: HTTPResponseAck

Defined in: [src/receivers/HTTPResponseAck.ts:20](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L20)

## Implements

- [`ResponseAck`](../interfaces/ResponseAck.md)

## Constructors

### Constructor

```ts
new HTTPResponseAck(args): HTTPResponseAck;
```

Defined in: [src/receivers/HTTPResponseAck.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L40)

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

Defined in: [src/receivers/HTTPResponseAck.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L38)

## Methods

### ack()

```ts
ack(): void;
```

Defined in: [src/receivers/HTTPResponseAck.ts:89](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L89)

#### Returns

`void`

***

### bind()

```ts
bind(): AckFn<any>;
```

Defined in: [src/receivers/HTTPResponseAck.ts:66](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPResponseAck.ts#L66)

#### Returns

[`AckFn`](../type-aliases/AckFn.md)\<`any`\>

#### Implementation of

[`ResponseAck`](../interfaces/ResponseAck.md).[`bind`](../interfaces/ResponseAck.md#bind)
