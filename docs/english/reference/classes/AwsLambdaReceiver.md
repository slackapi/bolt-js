[@slack/bolt](../index.md) / AwsLambdaReceiver

# Class: AwsLambdaReceiver

Defined in: [src/receivers/AwsLambdaReceiver.ts:121](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L121)

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new AwsLambdaReceiver(__namedParameters): AwsLambdaReceiver;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:140](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L140)

#### Parameters

##### \_\_namedParameters

[`AwsLambdaReceiverOptions`](../interfaces/AwsLambdaReceiverOptions.md)

#### Returns

`AwsLambdaReceiver`

## Accessors

### logger

#### Get Signature

```ts
get logger(): Logger;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:128](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L128)

##### Returns

[`Logger`](../interfaces/Logger.md)

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:168](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L168)

#### Parameters

##### app

[`App`](App.md)

#### Returns

`void`

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`init`](../interfaces/Receiver.md#init)

***

### start()

```ts
start(..._args): Promise<AwsHandler>;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:173](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L173)

#### Parameters

##### \_args

...`any`[]

#### Returns

`Promise`\<`AwsHandler`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`start`](../interfaces/Receiver.md#start)

***

### stop()

```ts
stop(..._args): Promise<void>;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:185](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L185)

#### Parameters

##### \_args

...`any`[]

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)

***

### toHandler()

```ts
toHandler(): AwsHandler;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:191](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L191)

#### Returns

`AwsHandler`
