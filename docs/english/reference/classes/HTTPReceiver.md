# HTTPReceiver

Defined in: [src/receivers/HTTPReceiver.ts:129](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L129)

Receives HTTP requests with Events, Slash Commands, and Actions

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new HTTPReceiver(__namedParameters): HTTPReceiver;
```

Defined in: [src/receivers/HTTPReceiver.ts:176](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L176)

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

Defined in: [src/receivers/HTTPReceiver.ts:148](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L148)

***

### requestListener

```ts
requestListener: RequestListener;
```

Defined in: [src/receivers/HTTPReceiver.ts:144](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L144)

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/receivers/HTTPReceiver.ts:269](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L269)

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

Defined in: [src/receivers/HTTPReceiver.ts:273](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L273)

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

Defined in: [src/receivers/HTTPReceiver.ts:274](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L274)

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

Defined in: [src/receivers/HTTPReceiver.ts:275](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L275)

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

Defined in: [src/receivers/HTTPReceiver.ts:276](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L276)

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

Defined in: [src/receivers/HTTPReceiver.ts:364](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L364)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)
