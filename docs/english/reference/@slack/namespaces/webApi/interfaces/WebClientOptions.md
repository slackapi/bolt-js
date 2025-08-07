[@slack/bolt](../../../../index.md) / [webApi](../index.md) / WebClientOptions

# Interface: WebClientOptions

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:9

## Properties

### adapter?

```ts
optional adapter: AxiosAdapter;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:56

Custom functions for modifing and handling outgoing requests.
Useful if you would like to manage outgoing request with a custom http client.
See [Axios adapter documentation](https://github.com/axios/axios/blob/v1.x/README.md?plain=1#L586) for more information.

#### Default

```ts
undefined
```

***

### agent?

```ts
optional agent: Agent;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:21

***

### allowAbsoluteUrls?

```ts
optional allowAbsoluteUrls: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:35

Determines if a dynamic method name being an absolute URL overrides the configured slackApiUrl.
When set to false, the URL used in Slack API requests will always begin with the slackApiUrl.

See [https://tools.slack.dev/node-slack-sdk/web-api#call-a-method](https://tools.slack.dev/node-slack-sdk/web-api#call-a-method) for more details.
See [https://github.com/axios/axios?tab=readme-ov-file#request-config](https://github.com/axios/axios?tab=readme-ov-file#request-config) for more details.

#### Default

```ts
true
```

***

### attachOriginalToWebAPIRequestError?

```ts
optional attachOriginalToWebAPIRequestError: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:42

Indicates whether to attach the original error to a Web API request error.
When set to true, the original error object will be attached to the Web API request error.

#### Default

```ts
true
```

***

### headers?

```ts
optional headers: Record<string, string>;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:25

***

### logger?

```ts
optional logger: Logger;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:17

***

### logLevel?

```ts
optional logLevel: LogLevel;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:18

***

### maxRequestConcurrency?

```ts
optional maxRequestConcurrency: number;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:19

***

### rejectRateLimitedCalls?

```ts
optional rejectRateLimitedCalls: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:24

***

### requestInterceptor?

```ts
optional requestInterceptor: RequestInterceptor;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:48

Custom function to modify outgoing requests. See [Axios interceptor documentation](https://axios-http.com/docs/interceptors) for more details.

#### Default

```ts
undefined
```

***

### retryConfig?

```ts
optional retryConfig: RetryOptions;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:20

***

### slackApiUrl?

```ts
optional slackApiUrl: string;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:16

The base URL requests are sent to. Often unchanged, but might be set for testing techniques.

See [https://tools.slack.dev/node-slack-sdk/web-api/#custom-api-url](https://tools.slack.dev/node-slack-sdk/web-api/#custom-api-url) for more information.

#### Default

```ts
https://slack.com/api/
```

***

### teamId?

```ts
optional teamId: string;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:26

***

### timeout?

```ts
optional timeout: number;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:23

***

### tls?

```ts
optional tls: TLSOptions;
```

Defined in: node\_modules/@slack/web-api/dist/WebClient.d.ts:22
