[@slack/bolt](../index.md) / ExpressReceiverOptions

# Interface: ExpressReceiverOptions

Defined in: [src/receivers/ExpressReceiver.ts:92](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L92)

## Properties

### app?

```ts
optional app: Application;
```

Defined in: [src/receivers/ExpressReceiver.ts:110](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L110)

***

### clientId?

```ts
optional clientId: string;
```

Defined in: [src/receivers/ExpressReceiver.ts:103](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L103)

***

### clientSecret?

```ts
optional clientSecret: string;
```

Defined in: [src/receivers/ExpressReceiver.ts:104](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L104)

***

### customPropertiesExtractor()?

```ts
optional customPropertiesExtractor: (request) => StringIndexed;
```

Defined in: [src/receivers/ExpressReceiver.ts:112](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L112)

#### Parameters

##### request

`Request`

#### Returns

[`StringIndexed`](../type-aliases/StringIndexed.md)

***

### dispatchErrorHandler()?

```ts
optional dispatchErrorHandler: (args) => Promise<void>;
```

Defined in: [src/receivers/ExpressReceiver.ts:113](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L113)

#### Parameters

##### args

[`ReceiverDispatchErrorHandlerArgs`](ReceiverDispatchErrorHandlerArgs.md)

#### Returns

`Promise`\<`void`\>

***

### endpoints?

```ts
optional endpoints: 
  | string
  | {
[endpointType: string]: string;
};
```

Defined in: [src/receivers/ExpressReceiver.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L96)

***

### installationStore?

```ts
optional installationStore: InstallationStore;
```

Defined in: [src/receivers/ExpressReceiver.ts:107](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L107)

***

### installerOptions?

```ts
optional installerOptions: InstallerOptions;
```

Defined in: [src/receivers/ExpressReceiver.ts:109](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L109)

***

### logger?

```ts
optional logger: Logger;
```

Defined in: [src/receivers/ExpressReceiver.ts:94](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L94)

***

### logLevel?

```ts
optional logLevel: LogLevel;
```

Defined in: [src/receivers/ExpressReceiver.ts:95](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L95)

***

### processBeforeResponse?

```ts
optional processBeforeResponse: boolean;
```

Defined in: [src/receivers/ExpressReceiver.ts:102](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L102)

***

### processEventErrorHandler()?

```ts
optional processEventErrorHandler: (args) => Promise<boolean>;
```

Defined in: [src/receivers/ExpressReceiver.ts:114](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L114)

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

Defined in: [src/receivers/ExpressReceiver.ts:106](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L106)

***

### router?

```ts
optional router: IRouter;
```

Defined in: [src/receivers/ExpressReceiver.ts:111](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L111)

***

### scopes?

```ts
optional scopes: string | string[];
```

Defined in: [src/receivers/ExpressReceiver.ts:108](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L108)

***

### signatureVerification?

```ts
optional signatureVerification: boolean;
```

Defined in: [src/receivers/ExpressReceiver.ts:101](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L101)

***

### signingSecret

```ts
signingSecret: string | () => PromiseLike<string>;
```

Defined in: [src/receivers/ExpressReceiver.ts:93](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L93)

***

### stateSecret?

```ts
optional stateSecret: string;
```

Defined in: [src/receivers/ExpressReceiver.ts:105](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L105)

***

### unhandledRequestHandler()?

```ts
optional unhandledRequestHandler: (args) => void;
```

Defined in: [src/receivers/ExpressReceiver.ts:118](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L118)

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

Defined in: [src/receivers/ExpressReceiver.ts:119](https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts#L119)
