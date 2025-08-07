[@slack/bolt](../index.md) / HTTPReceiver

# Class: HTTPReceiver

Defined in: [src/receivers/HTTPReceiver.ts:127](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L127)

Receives HTTP requests with Events, Slash Commands, and Actions

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new HTTPReceiver(__namedParameters): HTTPReceiver;
```

Defined in: [src/receivers/HTTPReceiver.ts:172](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L172)

#### Parameters

##### \_\_namedParameters

[`HTTPReceiverOptions`](../interfaces/HTTPReceiverOptions.md)

#### Returns

`HTTPReceiver`

## Properties

### installer?

```ts
optional installer: InstallProvider;
```

Defined in: [src/receivers/HTTPReceiver.ts:146](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L146)

***

### requestListener

```ts
requestListener: RequestListener;
```

Defined in: [src/receivers/HTTPReceiver.ts:142](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L142)

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/receivers/HTTPReceiver.ts:262](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L262)

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

Defined in: [src/receivers/HTTPReceiver.ts:266](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L266)

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

Defined in: [src/receivers/HTTPReceiver.ts:267](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L267)

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

Defined in: [src/receivers/HTTPReceiver.ts:268](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L268)

##### Parameters

###### portOrListenOptions

`string` | `number` | `ListenOptions`

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

Defined in: [src/receivers/HTTPReceiver.ts:269](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L269)

##### Parameters

###### portOrListenOptions

`string` | `number` | `ListenOptions`

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

Defined in: [src/receivers/HTTPReceiver.ts:357](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L357)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)
