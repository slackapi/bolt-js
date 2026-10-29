# ExpressReceiverOptions

Defined in: [src/receivers/ExpressReceiver.ts:92](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L92)

## Properties

### app?

```ts
app?: Application;
```

Defined in: [src/receivers/ExpressReceiver.ts:110](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L110)

***

### bodyLimit?

```ts
bodyLimit?: string | number;
```

Defined in: [src/receivers/ExpressReceiver.ts:120](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L120)

***

### clientId?

```ts
clientId?: string;
```

Defined in: [src/receivers/ExpressReceiver.ts:103](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L103)

***

### clientSecret?

```ts
clientSecret?: string;
```

Defined in: [src/receivers/ExpressReceiver.ts:104](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L104)

***

### customPropertiesExtractor?

```ts
customPropertiesExtractor?: (request) => StringIndexed;
```

Defined in: [src/receivers/ExpressReceiver.ts:112](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L112)

#### Parameters

##### request

`Request`

#### Returns

[`StringIndexed`](../type-aliases/StringIndexed.md)

***

### dispatchErrorHandler?

```ts
dispatchErrorHandler?: (args) => Promise<void>;
```

Defined in: [src/receivers/ExpressReceiver.ts:113](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L113)

#### Parameters

##### args

[`ReceiverDispatchErrorHandlerArgs`](../bolt/namespaces/HTTPModuleFunctions/interfaces/ReceiverDispatchErrorHandlerArgs.md)

#### Returns

`Promise`\<`void`\>

***

### endpoints?

```ts
endpoints?: 
  | string
  | {
[endpointType: string]: string;
};
```

Defined in: [src/receivers/ExpressReceiver.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L96)

***

### installationStore?

```ts
installationStore?: InstallationStore;
```

Defined in: [src/receivers/ExpressReceiver.ts:107](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L107)

***

### installerOptions?

```ts
installerOptions?: InstallerOptions;
```

Defined in: [src/receivers/ExpressReceiver.ts:109](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L109)

***

### logger?

```ts
logger?: Logger;
```

Defined in: [src/receivers/ExpressReceiver.ts:94](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L94)

***

### logLevel?

```ts
logLevel?: LogLevel;
```

Defined in: [src/receivers/ExpressReceiver.ts:95](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L95)

***

### processBeforeResponse?

```ts
processBeforeResponse?: boolean;
```

Defined in: [src/receivers/ExpressReceiver.ts:102](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L102)

***

### processEventErrorHandler?

```ts
processEventErrorHandler?: (args) => Promise<boolean>;
```

Defined in: [src/receivers/ExpressReceiver.ts:114](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L114)

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

Defined in: [src/receivers/ExpressReceiver.ts:106](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L106)

***

### router?

```ts
router?: IRouter;
```

Defined in: [src/receivers/ExpressReceiver.ts:111](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L111)

***

### scopes?

```ts
scopes?: string | string[];
```

Defined in: [src/receivers/ExpressReceiver.ts:108](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L108)

***

### signatureVerification?

```ts
signatureVerification?: boolean;
```

Defined in: [src/receivers/ExpressReceiver.ts:101](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L101)

***

### signingSecret

```ts
signingSecret: string | (() => PromiseLike<string>);
```

Defined in: [src/receivers/ExpressReceiver.ts:93](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L93)

***

### stateSecret?

```ts
stateSecret?: string;
```

Defined in: [src/receivers/ExpressReceiver.ts:105](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L105)

***

### unhandledRequestHandler?

```ts
unhandledRequestHandler?: (args) => void;
```

Defined in: [src/receivers/ExpressReceiver.ts:118](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L118)

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

Defined in: [src/receivers/ExpressReceiver.ts:119](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L119)
