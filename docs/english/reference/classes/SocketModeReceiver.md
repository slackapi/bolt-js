# Class: SocketModeReceiver

Defined in: [src/receivers/SocketModeReceiver.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L83)

Receives Events, Slash Commands, and Actions of a web socket connection

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new SocketModeReceiver(__namedParameters): SocketModeReceiver;
```

Defined in: [src/receivers/SocketModeReceiver.ts:101](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L101)

#### Parameters

##### \_\_namedParameters

[`SocketModeReceiverOptions`](../interfaces/SocketModeReceiverOptions.md)

#### Returns

`SocketModeReceiver`

## Properties

### client

```ts
client: SocketModeClient;
```

Defined in: [src/receivers/SocketModeReceiver.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L85)

***

### installer

```ts
installer: InstallProvider | undefined = undefined;
```

Defined in: [src/receivers/SocketModeReceiver.ts:91](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L91)

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/receivers/SocketModeReceiver.ts:268](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L268)

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
start(): Promise<AppsConnectionsOpenResponse>;
```

Defined in: [src/receivers/SocketModeReceiver.ts:272](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L272)

#### Returns

`Promise`\<`AppsConnectionsOpenResponse`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`start`](../interfaces/Receiver.md#start)

***

### stop()

```ts
stop(): Promise<void>;
```

Defined in: [src/receivers/SocketModeReceiver.ts:281](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L281)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)
