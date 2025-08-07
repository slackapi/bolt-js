[@slack/bolt](../index.md) / Context

# Interface: Context

Defined in: [src/types/middleware.ts:37](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L37)

Context object, which provides contextual information associated with an incoming requests.
You can set any other custom attributes in global middleware as long as the key does not conflict with others.

## Extends

- [`StringIndexed`](../type-aliases/StringIndexed.md)

## Indexable

```ts
[key: string]: any
```

## Properties

### botId?

```ts
optional botId: string;
```

Defined in: [src/types/middleware.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L53)

This app's bot ID in the installed workspace.
This is required for `ignoreSelf` global middleware.
see also: https://github.com/slackapi/bolt-js/issues/874

***

### botToken?

```ts
optional botToken: string;
```

Defined in: [src/types/middleware.ts:42](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L42)

A bot token, which starts with `xoxb-`.
This value can be used by `say` (preferred over userToken),

***

### botUserId?

```ts
optional botUserId: string;
```

Defined in: [src/types/middleware.ts:58](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L58)

This app's bot user ID in the installed workspace.
This value is optional but allows `ignoreSelf` global middleware be more filter more than just message events.

***

### enterpriseId?

```ts
optional enterpriseId: string;
```

Defined in: [src/types/middleware.ts:70](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L70)

Enterprise Grid Organization ID.

***

### functionBotAccessToken?

```ts
optional functionBotAccessToken: string;
```

Defined in: [src/types/middleware.ts:81](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L81)

A JIT and function-specific token that, when used to make API calls,
creates an association between a function's execution and subsequent actions
(e.g., buttons and other interactivity)

***

### functionExecutionId?

```ts
optional functionExecutionId: string;
```

Defined in: [src/types/middleware.ts:86](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L86)

Function execution ID associated with the event

***

### functionInputs?

```ts
optional functionInputs: FunctionInputs;
```

Defined in: [src/types/middleware.ts:91](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L91)

Inputs that were provided to a function when it was executed

***

### isEnterpriseInstall

```ts
isEnterpriseInstall: boolean;
```

Defined in: [src/types/middleware.ts:74](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L74)

Is the app installed at an Enterprise level?

***

### retryNum?

```ts
optional retryNum: number;
```

Defined in: [src/types/middleware.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L96)

Retry count of an Events API request (this property does not exist for other requests)

***

### retryReason?

```ts
optional retryReason: string;
```

Defined in: [src/types/middleware.ts:100](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L100)

Retry reason of an Events API request (this property does not exist for other requests)

***

### teamId?

```ts
optional teamId: string;
```

Defined in: [src/types/middleware.ts:66](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L66)

Workspace ID.

***

### userId?

```ts
optional userId: string;
```

Defined in: [src/types/middleware.ts:62](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L62)

User ID.

***

### userToken?

```ts
optional userToken: string;
```

Defined in: [src/types/middleware.ts:47](https://github.com/slackapi/bolt-js/blob/main/src/types/middleware.ts#L47)

A bot token, which starts with `xoxp-`.
This value can be used by `say` (overridden by botToken),
