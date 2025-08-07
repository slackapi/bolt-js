[@slack/bolt](../index.md) / ExpressReceiver

# Class: ExpressReceiver

Defined in: [src/receivers/ExpressReceiver.ts:145](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L145)

Receives HTTP requests with Events, Slash Commands, and Actions

## Implements

- [`Receiver`](../interfaces/Receiver.md)

## Constructors

### Constructor

```ts
new ExpressReceiver(__namedParameters): ExpressReceiver;
```

Defined in: [src/receivers/ExpressReceiver.ts:175](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L175)

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

Defined in: [src/receivers/ExpressReceiver.ts:147](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L147)

***

### installer

```ts
installer: undefined | InstallProvider = undefined;
```

Defined in: [src/receivers/ExpressReceiver.ts:161](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L161)

***

### installerOptions?

```ts
optional installerOptions: InstallerOptions;
```

Defined in: [src/receivers/ExpressReceiver.ts:163](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L163)

***

### router

```ts
router: IRouter;
```

Defined in: [src/receivers/ExpressReceiver.ts:159](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L159)

## Methods

### init()

```ts
init(bolt): void;
```

Defined in: [src/receivers/ExpressReceiver.ts:353](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L353)

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

Defined in: [src/receivers/ExpressReceiver.ts:314](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L314)

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

Defined in: [src/receivers/ExpressReceiver.ts:358](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L358)

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

Defined in: [src/receivers/ExpressReceiver.ts:359](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L359)

##### Parameters

###### portOrListenOptions

`number` | `ListenOptions`

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

Defined in: [src/receivers/ExpressReceiver.ts:360](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L360)

##### Parameters

###### portOrListenOptions

`number` | `ListenOptions`

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

Defined in: [src/receivers/ExpressReceiver.ts:424](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L424)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Receiver`](../interfaces/Receiver.md).[`stop`](../interfaces/Receiver.md#stop)
