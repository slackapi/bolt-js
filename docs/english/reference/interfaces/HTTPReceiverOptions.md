# HTTPReceiverOptions

Defined in: [src/receivers/HTTPReceiver.ts:76](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L76)

## Properties

### bodyLimit?

```ts
bodyLimit?: string | number;
```

Defined in: [src/receivers/HTTPReceiver.ts:100](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L100)

***

### clientId?

```ts
clientId?: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L85)

***

### clientSecret?

```ts
clientSecret?: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:86](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L86)

***

### customPropertiesExtractor?

```ts
customPropertiesExtractor?: (request) => StringIndexed;
```

Defined in: [src/receivers/HTTPReceiver.ts:92](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L92)

#### Parameters

##### request

[`BufferedIncomingMessage`](BufferedIncomingMessage.md)

#### Returns

[`StringIndexed`](../type-aliases/StringIndexed.md)

***

### customRoutes?

```ts
customRoutes?: CustomRoute[];
```

Defined in: [src/receivers/HTTPReceiver.ts:80](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L80)

***

### dispatchErrorHandler?

```ts
dispatchErrorHandler?: (args) => void;
```

Defined in: [src/receivers/HTTPReceiver.ts:94](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L94)

#### Parameters

##### args

[`ReceiverDispatchErrorHandlerArgs`](../bolt/namespaces/HTTPModuleFunctions/interfaces/ReceiverDispatchErrorHandlerArgs.md)

#### Returns

`void`

***

### endpoints?

```ts
endpoints?: string | string[];
```

Defined in: [src/receivers/HTTPReceiver.ts:78](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L78)

***

### installationStore?

```ts
installationStore?: InstallationStore;
```

Defined in: [src/receivers/HTTPReceiver.ts:89](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L89)

***

### installerOptions?

```ts
installerOptions?: HTTPReceiverInstallerOptions;
```

Defined in: [src/receivers/HTTPReceiver.ts:91](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L91)

***

### logger?

```ts
logger?: Logger;
```

Defined in: [src/receivers/HTTPReceiver.ts:81](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L81)

***

### logLevel?

```ts
logLevel?: LogLevel;
```

Defined in: [src/receivers/HTTPReceiver.ts:82](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L82)

***

### port?

```ts
port?: number;
```

Defined in: [src/receivers/HTTPReceiver.ts:79](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L79)

***

### processBeforeResponse?

```ts
processBeforeResponse?: boolean;
```

Defined in: [src/receivers/HTTPReceiver.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L83)

***

### processEventErrorHandler?

```ts
processEventErrorHandler?: (args) => Promise<boolean>;
```

Defined in: [src/receivers/HTTPReceiver.ts:95](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L95)

#### Parameters

##### args

[`ReceiverProcessEventErrorHandlerArgs`](../bolt/namespaces/HTTPModuleFunctions/interfaces/ReceiverProcessEventErrorHandlerArgs.md)

#### Returns

`Promise`\<`boolean`\>

***

### redirectUri?

```ts
redirectUri?: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:88](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L88)

***

### scopes?

```ts
scopes?: string | string[];
```

Defined in: [src/receivers/HTTPReceiver.ts:90](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L90)

***

### signatureVerification?

```ts
signatureVerification?: boolean;
```

Defined in: [src/receivers/HTTPReceiver.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L84)

***

### signingSecret

```ts
signingSecret: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:77](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L77)

***

### stateSecret?

```ts
stateSecret?: string;
```

Defined in: [src/receivers/HTTPReceiver.ts:87](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L87)

***

### unhandledRequestHandler?

```ts
unhandledRequestHandler?: (args) => void;
```

Defined in: [src/receivers/HTTPReceiver.ts:98](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L98)

#### Parameters

##### args

[`ReceiverUnhandledRequestHandlerArgs`](../bolt/namespaces/HTTPModuleFunctions/interfaces/ReceiverUnhandledRequestHandlerArgs.md)

#### Returns

`void`

***

### unhandledRequestTimeoutMillis?

```ts
unhandledRequestTimeoutMillis?: number;
```

Defined in: [src/receivers/HTTPReceiver.ts:99](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPReceiver.ts#L99)
