---
sidebar_label: "HTTPReceiver"
---

[@slack/bolt](../index.md) / HTTPReceiver

# Class: HTTPReceiver

Defined in: [src/receivers/HTTPReceiver.ts:128](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L128)

Receives HTTP requests with Events, Slash Commands, and Actions

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new HTTPReceiver(__namedParameters): HTTPReceiver;
```

Defined in: [src/receivers/HTTPReceiver.ts:173](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L173)

#### Parameters

##### \_\_namedParameters

[`HTTPReceiverOptions`](../interfaces/HTTPReceiverOptions.md)

#### Returns

`HTTPReceiver`

## Properties

### installer?

```ts
optional installer?: InstallProvider;
```

Defined in: [src/receivers/HTTPReceiver.ts:147](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L147)

***

### requestListener

```ts
requestListener: RequestListener;
```

Defined in: [src/receivers/HTTPReceiver.ts:143](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L143)

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/receivers/HTTPReceiver.ts:264](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L264)

#### Parameters

##### app

[`App`](App.md)

#### Returns

`void`

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`init`](../interfaces/Receiver.md#init)

***

### start()

#### Call Signature

```ts
start(port): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;
```

Defined in: [src/receivers/HTTPReceiver.ts:268](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L268)

##### Parameters

###### port

`number`

##### Returns

`Promise`\<`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>\>

##### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`start`](../interfaces/Receiver.md#start)

#### Call Signature

```ts
start(port): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;
```

Defined in: [src/receivers/HTTPReceiver.ts:269](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L269)

##### Parameters

###### port

`string`

##### Returns

`Promise`\<`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>\>

##### Implementation of

```ts
Receiver.start
```

#### Call Signature

```ts
start(portOrListenOptions, serverOptions?): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;
```

Defined in: [src/receivers/HTTPReceiver.ts:270](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L270)

##### Parameters

###### portOrListenOptions

`string` \| `number` \| `ListenOptions`

###### serverOptions?

`ServerOptions`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>

##### Returns

`Promise`\<`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>\>

##### Implementation of

```ts
Receiver.start
```

#### Call Signature

```ts
start(portOrListenOptions, httpsServerOptions?): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;
```

Defined in: [src/receivers/HTTPReceiver.ts:271](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L271)

##### Parameters

###### portOrListenOptions

`string` \| `number` \| `ListenOptions`

###### httpsServerOptions?

`ServerOptions`

##### Returns

`Promise`\<`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>\>

##### Implementation of

```ts
Receiver.start
```

***

### stop()

```ts
stop(): Promise<void>;
```

Defined in: [src/receivers/HTTPReceiver.ts:359](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L359)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)
