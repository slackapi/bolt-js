# SocketModeReceiverOptions

Defined in: [src/receivers/SocketModeReceiver.ts:31](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L31)

## Properties

### appToken

```ts
appToken: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:41](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L41)

***

### autoReconnectEnabled?

```ts
optional autoReconnectEnabled?: boolean;
```

Defined in: [src/receivers/SocketModeReceiver.ts:47](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L47)

***

### clientId?

```ts
optional clientId?: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:34](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L34)

***

### clientPingTimeout?

```ts
optional clientPingTimeout?: number;
```

Defined in: [src/receivers/SocketModeReceiver.ts:44](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L44)

***

### clientSecret?

```ts
optional clientSecret?: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:35](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L35)

***

### customPropertiesExtractor?

```ts
optional customPropertiesExtractor?: (args) => StringIndexed;
```

Defined in: [src/receivers/SocketModeReceiver.ts:49](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L49)

#### Parameters

##### args

`any`

#### Returns

[`StringIndexed`](../type-aliases/StringIndexed.md)

***

### customRoutes?

```ts
optional customRoutes?: CustomRoute[];
```

Defined in: [src/receivers/SocketModeReceiver.ts:43](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L43)

***

### dispatcher?

```ts
optional dispatcher?: SocketModeDispatcher;
```

Defined in: [src/receivers/SocketModeReceiver.ts:42](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L42)

***

### installationStore?

```ts
optional installationStore?: InstallationStore;
```

Defined in: [src/receivers/SocketModeReceiver.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L38)

***

### installerOptions?

```ts
optional installerOptions?: InstallerOptions;
```

Defined in: [src/receivers/SocketModeReceiver.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L40)

***

### logger?

```ts
optional logger?: Logger;
```

Defined in: [src/receivers/SocketModeReceiver.ts:32](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L32)

***

### logLevel?

```ts
optional logLevel?: LogLevel;
```

Defined in: [src/receivers/SocketModeReceiver.ts:33](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L33)

***

### pingPongLoggingEnabled?

```ts
optional pingPongLoggingEnabled?: boolean;
```

Defined in: [src/receivers/SocketModeReceiver.ts:46](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L46)

***

### processEventErrorHandler?

```ts
optional processEventErrorHandler?: (args) => Promise<boolean>;
```

Defined in: [src/receivers/SocketModeReceiver.ts:50](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L50)

#### Parameters

##### args

[`SocketModeReceiverProcessEventErrorHandlerArgs`](SocketModeReceiverProcessEventErrorHandlerArgs.md)

#### Returns

`Promise`\<`boolean`\>

***

### redirectUri?

```ts
optional redirectUri?: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:37](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L37)

***

### scopes?

```ts
optional scopes?: string | string[];
```

Defined in: [src/receivers/SocketModeReceiver.ts:39](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L39)

***

### serverPingTimeout?

```ts
optional serverPingTimeout?: number;
```

Defined in: [src/receivers/SocketModeReceiver.ts:45](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L45)

***

### stateSecret?

```ts
optional stateSecret?: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:36](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L36)
