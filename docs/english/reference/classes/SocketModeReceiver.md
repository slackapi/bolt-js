[@slack/bolt](../index.md) / SocketModeReceiver

# Class: SocketModeReceiver

Defined in: [src/receivers/SocketModeReceiver.ts:77](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L77)

Receives Events, Slash Commands, and Actions of a web socket connection

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new SocketModeReceiver(__namedParameters): SocketModeReceiver;
```

Defined in: [src/receivers/SocketModeReceiver.ts:95](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L95)

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

Defined in: [src/receivers/SocketModeReceiver.ts:79](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L79)

***

### installer

```ts
installer: undefined | InstallProvider = undefined;
```

Defined in: [src/receivers/SocketModeReceiver.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L85)

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/receivers/SocketModeReceiver.ts:252](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L252)

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

Defined in: [src/receivers/SocketModeReceiver.ts:256](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L256)

#### Returns

`Promise`\<[`AppsConnectionsOpenResponse`](../@slack/namespaces/webApi/type-aliases/AppsConnectionsOpenResponse.md)\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`start`](../interfaces/Receiver.md#start)

***

### stop()

```ts
stop(): Promise<void>;
```

Defined in: [src/receivers/SocketModeReceiver.ts:265](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L265)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)
