# AwsLambdaReceiver

Defined in: [src/receivers/AwsLambdaReceiver.ts:131](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L131)

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new AwsLambdaReceiver(__namedParameters): AwsLambdaReceiver;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:150](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L150)

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

Defined in: [src/receivers/AwsLambdaReceiver.ts:138](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L138)

##### Returns

`Logger`

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:179](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L179)

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

Defined in: [src/receivers/AwsLambdaReceiver.ts:184](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L184)

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

Defined in: [src/receivers/AwsLambdaReceiver.ts:196](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L196)

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

Defined in: [src/receivers/AwsLambdaReceiver.ts:202](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L202)

#### Returns

`AwsHandler`
