[@slack/bolt](../index.md) / AwsLambdaReceiverOptions

# Interface: AwsLambdaReceiverOptions

Defined in: [src/receivers/AwsLambdaReceiver.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L84)

## Properties

### customPropertiesExtractor?

```ts
optional customPropertiesExtractor?: (request) => StringIndexed;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:120](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L120)

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

### invalidRequestSignatureHandler?

```ts
optional invalidRequestSignatureHandler?: (args) => void;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:121](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L121)

#### Parameters

##### args

`ReceiverInvalidRequestSignatureHandlerArgs`

#### Returns

`void`

***

### logger?

```ts
optional logger?: Logger;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:100](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L100)

The Logger for the receiver

#### Default

```ts
ConsoleLogger
```

***

### logLevel?

```ts
optional logLevel?: LogLevel;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:106](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L106)

The LogLevel to be used for the logger.

#### Default

```ts
LogLevel.INFO
```

***

### signatureVerification?

```ts
optional signatureVerification?: boolean;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:112](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L112)

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

Defined in: [src/receivers/AwsLambdaReceiver.ts:94](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L94)

The Slack Signing secret to be used as an input to signature verification to ensure that requests are coming from
Slack.

If the [signatureVerification](#signatureverification) flag is set to `false`, this can be set to any value as signature verification
using this secret will not be performed.

#### See

[https://api.slack.com/authentication/verifying-requests-from-slack#about](https://api.slack.com/authentication/verifying-requests-from-slack#about) for details about signing secrets

***

### unhandledRequestTimeoutMillis?

```ts
optional unhandledRequestTimeoutMillis?: number;
```

Defined in: [src/receivers/AwsLambdaReceiver.ts:122](https://github.com/slackapi/bolt-js/blob/main/src/receivers/AwsLambdaReceiver.ts#L122)
