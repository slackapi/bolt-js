# ExpressReceiver

Defined in: [src/receivers/ExpressReceiver.ts:146](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L146)

Receives HTTP requests with Events, Slash Commands, and Actions

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new ExpressReceiver(__namedParameters): ExpressReceiver;
```

Defined in: [src/receivers/ExpressReceiver.ts:176](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L176)

#### Parameters

##### \_\_namedParameters

[`ExpressReceiverOptions`](../interfaces/ExpressReceiverOptions.md)

#### Returns

`ExpressReceiver`

## Properties

### app

```ts
app: Application;
```

Defined in: [src/receivers/ExpressReceiver.ts:148](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L148)

***

### installer

```ts
installer: InstallProvider | undefined = undefined;
```

Defined in: [src/receivers/ExpressReceiver.ts:162](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L162)

***

### installerOptions?

```ts
optional installerOptions?: InstallerOptions;
```

Defined in: [src/receivers/ExpressReceiver.ts:164](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L164)

***

### router

```ts
router: IRouter;
```

Defined in: [src/receivers/ExpressReceiver.ts:160](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L160)

## Methods

### init()

```ts
init(bolt): void;
```

Defined in: [src/receivers/ExpressReceiver.ts:359](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L359)

#### Parameters

##### bolt

[`App`](App.md)

#### Returns

`void`

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`init`](../interfaces/Receiver.md#init)

***

### requestHandler()

```ts
requestHandler(req, res): Promise<void>;
```

Defined in: [src/receivers/ExpressReceiver.ts:319](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L319)

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### start()

#### Call Signature

```ts
start(port): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;
```

Defined in: [src/receivers/ExpressReceiver.ts:364](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L364)

##### Parameters

###### port

`number`

##### Returns

`Promise`\<`Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>\>

##### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`start`](../interfaces/Receiver.md#start)

#### Call Signature

```ts
start(portOrListenOptions, serverOptions?): Promise<Server<typeof IncomingMessage, typeof ServerResponse>>;
```

Defined in: [src/receivers/ExpressReceiver.ts:365](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L365)

##### Parameters

###### portOrListenOptions

`number` \| `ListenOptions`

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

Defined in: [src/receivers/ExpressReceiver.ts:366](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L366)

##### Parameters

###### portOrListenOptions

`number` \| `ListenOptions`

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

Defined in: [src/receivers/ExpressReceiver.ts:430](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L430)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)
