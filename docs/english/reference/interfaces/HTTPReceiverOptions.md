[@slack/bolt](../index.md) / HTTPReceiverOptions

# Interface: HTTPReceiverOptions

Defined in: [src/receivers/HTTPReceiver.ts:75](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L75)

## Properties

### clientId?

```ts
optional clientId: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L84)

***

### clientSecret?

```ts
optional clientSecret: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L85)

***

### customPropertiesExtractor()?

```ts
optional customPropertiesExtractor: (request) => StringIndexed;
```

Defined in: [src/receivers/HTTPReceiver.ts:91](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L91)

#### Parameters

##### request

[`BufferedIncomingMessage`](BufferedIncomingMessage.md)

#### Returns

[`StringIndexed`](../type-aliases/StringIndexed.md)

***

### customRoutes?

```ts
optional customRoutes: CustomRoute[];
```

Defined in: [src/receivers/HTTPReceiver.ts:79](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L79)

***

### dispatchErrorHandler()?

```ts
optional dispatchErrorHandler: (args) => void;
```

Defined in: [src/receivers/HTTPReceiver.ts:93](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L93)

#### Parameters

##### args

[`ReceiverDispatchErrorHandlerArgs`](ReceiverDispatchErrorHandlerArgs.md)

#### Returns

`void`

***

### endpoints?

```ts
optional endpoints: string | string[];
```

Defined in: [src/receivers/HTTPReceiver.ts:77](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L77)

***

### installationStore?

```ts
optional installationStore: InstallationStore;
```

Defined in: [src/receivers/HTTPReceiver.ts:88](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L88)

***

### installerOptions?

```ts
optional installerOptions: HTTPReceiverInstallerOptions;
```

Defined in: [src/receivers/HTTPReceiver.ts:90](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L90)

***

### logger?

```ts
optional logger: Logger;
```

Defined in: [src/receivers/HTTPReceiver.ts:80](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L80)

***

### logLevel?

```ts
optional logLevel: LogLevel;
```

Defined in: [src/receivers/HTTPReceiver.ts:81](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L81)

***

### port?

```ts
optional port: number;
```

Defined in: [src/receivers/HTTPReceiver.ts:78](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L78)

***

### processBeforeResponse?

```ts
optional processBeforeResponse: boolean;
```

Defined in: [src/receivers/HTTPReceiver.ts:82](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L82)

***

### processEventErrorHandler()?

```ts
optional processEventErrorHandler: (args) => Promise<boolean>;
```

Defined in: [src/receivers/HTTPReceiver.ts:94](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L94)

#### Parameters

##### args

[`ReceiverProcessEventErrorHandlerArgs`](ReceiverProcessEventErrorHandlerArgs.md)

#### Returns

`Promise`\<`boolean`\>

***

### redirectUri?

```ts
optional redirectUri: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:87](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L87)

***

### scopes?

```ts
optional scopes: string | string[];
```

Defined in: [src/receivers/HTTPReceiver.ts:89](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L89)

***

### signatureVerification?

```ts
optional signatureVerification: boolean;
```

Defined in: [src/receivers/HTTPReceiver.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L83)

***

### signingSecret

```ts
signingSecret: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:76](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L76)

***

### stateSecret?

```ts
optional stateSecret: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:86](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L86)

***

### unhandledRequestHandler()?

```ts
optional unhandledRequestHandler: (args) => void;
```

Defined in: [src/receivers/HTTPReceiver.ts:97](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L97)

#### Parameters

##### args

[`ReceiverUnhandledRequestHandlerArgs`](ReceiverUnhandledRequestHandlerArgs.md)

#### Returns

`void`

***

### unhandledRequestTimeoutMillis?

```ts
optional unhandledRequestTimeoutMillis: number;
```

Defined in: [src/receivers/HTTPReceiver.ts:98](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L98)
