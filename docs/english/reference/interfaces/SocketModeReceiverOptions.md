[@slack/bolt](../index.md) / SocketModeReceiverOptions

# Interface: SocketModeReceiverOptions

Defined in: [src/receivers/SocketModeReceiver.ts:30](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L30)

## Properties

### appToken

```ts
appToken: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L40)

***

### clientId?

```ts
optional clientId: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:33](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L33)

***

### clientSecret?

```ts
optional clientSecret: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:34](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L34)

***

### customPropertiesExtractor()?

```ts
optional customPropertiesExtractor: (args) => StringIndexed;
```

Defined in: [src/receivers/SocketModeReceiver.ts:43](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L43)

#### Parameters

##### args

`any`

#### Returns

[`StringIndexed`](../type-aliases/StringIndexed.md)

***

### customRoutes?

```ts
optional customRoutes: CustomRoute[];
```

Defined in: [src/receivers/SocketModeReceiver.ts:41](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L41)

***

### installationStore?

```ts
optional installationStore: InstallationStore;
```

Defined in: [src/receivers/SocketModeReceiver.ts:37](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L37)

***

### installerOptions?

```ts
optional installerOptions: InstallerOptions;
```

Defined in: [src/receivers/SocketModeReceiver.ts:39](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L39)

***

### logger?

```ts
optional logger: Logger;
```

Defined in: [src/receivers/SocketModeReceiver.ts:31](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L31)

***

### logLevel?

```ts
optional logLevel: LogLevel;
```

Defined in: [src/receivers/SocketModeReceiver.ts:32](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L32)

***

### processEventErrorHandler()?

```ts
optional processEventErrorHandler: (args) => Promise<boolean>;
```

Defined in: [src/receivers/SocketModeReceiver.ts:44](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L44)

#### Parameters

##### args

[`SocketModeReceiverProcessEventErrorHandlerArgs`](SocketModeReceiverProcessEventErrorHandlerArgs.md)

#### Returns

`Promise`\<`boolean`\>

***

### redirectUri?

```ts
optional redirectUri: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:36](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L36)

***

### scopes?

```ts
optional scopes: string | string[];
```

Defined in: [src/receivers/SocketModeReceiver.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L38)

***

### stateSecret?

```ts
optional stateSecret: string;
```

Defined in: [src/receivers/SocketModeReceiver.ts:35](https://github.com/slackapi/bolt-js/blob/main/src/receivers/SocketModeReceiver.ts#L35)
