[@slack/bolt](../index.md) / AwsLambdaReceiverOptions

# Interface: AwsLambdaReceiverOptions

Defined in: [src/receivers/AwsLambdaReceiver.ts:74](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L74)

## Properties

### customPropertiesExtractor()?

```ts
optional customPropertiesExtractor: (request) => StringIndexed;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:110](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L110)

Optional `function` that can extract custom properties from an incoming receiver event

#### Parameters

##### request

`AwsEvent`

The API Gateway event AwsEvent

#### Returns

[`StringIndexed`](../type-aliases/StringIndexed.md)

An object containing custom properties

#### Default

```ts
noop
```

***

### invalidRequestSignatureHandler()?

```ts
optional invalidRequestSignatureHandler: (args) => void;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:111](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L111)

#### Parameters

##### args

`ReceiverInvalidRequestSignatureHandlerArgs`

#### Returns

`void`

***

### logger?

```ts
optional logger: Logger;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:90](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L90)

The [Logger](Logger.md) for the receiver

#### Default

```ts
ConsoleLogger
```

***

### logLevel?

```ts
optional logLevel: LogLevel;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L96)

The [LogLevel](../enumerations/LogLevel.md) to be used for the logger.

#### Default

```ts
LogLevel.INFO
```

***

### signatureVerification?

```ts
optional signatureVerification: boolean;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:102](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L102)

Flag that determines whether Bolt should [Slack's signature on incoming requests](https://api.slack.com/authentication/verifying-requests-from-slack|verify).

#### Default

```ts
true
```

***

### signingSecret

```ts
signingSecret: string;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L84)

The Slack Signing secret to be used as an input to signature verification to ensure that requests are coming from
Slack.

If the [signatureVerification](#signatureverification) flag is set to `false`, this can be set to any value as signature verification
using this secret will not be performed.

#### See

[https://api.slack.com/authentication/verifying-requests-from-slack#about](https://api.slack.com/authentication/verifying-requests-from-slack#about) for details about signing secrets

***

### unhandledRequestTimeoutMillis?

```ts
optional unhandledRequestTimeoutMillis: number;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:112](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L112)
