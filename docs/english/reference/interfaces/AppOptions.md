[@slack/bolt](../index.md) / AppOptions

# Interface: AppOptions

Defined in: [src/App.ts:108](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L108)

App initialization options

## Properties

### agent?

```ts
optional agent: Agent;
```

Defined in: [src/App.ts:122](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L122)

***

### appToken?

```ts
optional appToken: string;
```

Defined in: [src/App.ts:126](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L126)

***

### attachFunctionToken?

```ts
optional attachFunctionToken: boolean;
```

Defined in: [src/App.ts:145](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L145)

***

### authorize?

```ts
optional authorize: Authorize<boolean>;
```

Defined in: [src/App.ts:129](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L129)

***

### botId?

```ts
optional botId: string;
```

Defined in: [src/App.ts:127](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L127)

***

### botUserId?

```ts
optional botUserId: string;
```

Defined in: [src/App.ts:128](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L128)

***

### clientId?

```ts
optional clientId: string;
```

Defined in: [src/App.ts:115](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L115)

***

### clientOptions?

```ts
optional clientOptions: WebClientOptions;
```

Defined in: [src/App.ts:139](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L139)

Configurations for the web client used to send Slack API method requests.

See [https://tools.slack.dev/node-slack-sdk/reference/web-api/interfaces/WebClientOptions](https://tools.slack.dev/node-slack-sdk/reference/web-api/interfaces/WebClientOptions) for more information.

***

### clientSecret?

```ts
optional clientSecret: string;
```

Defined in: [src/App.ts:116](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L116)

***

### clientTls?

```ts
optional clientTls: Pick<SecureContextOptions, "ca" | "cert" | "key" | "passphrase" | "pfx">;
```

Defined in: [src/App.ts:123](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L123)

***

### convoStore?

```ts
optional convoStore: false | ConversationStore<any>;
```

Defined in: [src/App.ts:124](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L124)

***

### customRoutes?

```ts
optional customRoutes: CustomRoute[];
```

Defined in: [src/App.ts:112](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L112)

***

### deferInitialization?

```ts
optional deferInitialization: boolean;
```

Defined in: [src/App.ts:143](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L143)

***

### developerMode?

```ts
optional developerMode: boolean;
```

Defined in: [src/App.ts:141](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L141)

***

### endpoints?

```ts
optional endpoints: string | string[];
```

Defined in: [src/App.ts:110](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L110)

***

### extendedErrorHandler?

```ts
optional extendedErrorHandler: boolean;
```

Defined in: [src/App.ts:144](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L144)

***

### ignoreSelf?

```ts
optional ignoreSelf: boolean;
```

Defined in: [src/App.ts:133](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L133)

***

### installationStore?

```ts
optional installationStore: InstallationStore;
```

Defined in: [src/App.ts:119](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L119)

***

### installerOptions?

```ts
optional installerOptions: HTTPReceiverInstallerOptions;
```

Defined in: [src/App.ts:121](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L121)

***

### logger?

```ts
optional logger: Logger;
```

Defined in: [src/App.ts:131](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L131)

***

### logLevel?

```ts
optional logLevel: LogLevel;
```

Defined in: [src/App.ts:132](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L132)

***

### port?

```ts
optional port: number;
```

Defined in: [src/App.ts:111](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L111)

***

### processBeforeResponse?

```ts
optional processBeforeResponse: boolean;
```

Defined in: [src/App.ts:113](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L113)

***

### receiver?

```ts
optional receiver: Receiver;
```

Defined in: [src/App.ts:130](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L130)

***

### redirectUri?

```ts
optional redirectUri: string;
```

Defined in: [src/App.ts:118](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L118)

***

### scopes?

```ts
optional scopes: string | string[];
```

Defined in: [src/App.ts:120](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L120)

***

### signatureVerification?

```ts
optional signatureVerification: boolean;
```

Defined in: [src/App.ts:114](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L114)

***

### signingSecret?

```ts
optional signingSecret: string;
```

Defined in: [src/App.ts:109](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L109)

***

### socketMode?

```ts
optional socketMode: boolean;
```

Defined in: [src/App.ts:140](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L140)

***

### stateSecret?

```ts
optional stateSecret: string;
```

Defined in: [src/App.ts:117](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L117)

***

### token?

```ts
optional token: string;
```

Defined in: [src/App.ts:125](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L125)

***

### tokenVerificationEnabled?

```ts
optional tokenVerificationEnabled: boolean;
```

Defined in: [src/App.ts:142](https://github.com/slackapi/bolt-js/blob/main/src/App.ts#L142)
