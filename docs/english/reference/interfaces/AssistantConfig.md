[@slack/bolt](../index.md) / AssistantConfig

# Interface: AssistantConfig

Defined in: [src/Assistant.ts:20](https://github.com/slackapi/bolt-js/blob/main/src/Assistant.ts#L20)

Configuration object used to instantiate the Assistant

## Properties

### threadContextChanged?

```ts
optional threadContextChanged: 
  | AssistantThreadContextChangedMiddleware
  | AssistantThreadContextChangedMiddleware[];
```

Defined in: [src/Assistant.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/Assistant.ts#L23)

***

### threadContextStore?

```ts
optional threadContextStore: AssistantThreadContextStore;
```

Defined in: [src/Assistant.ts:21](https://github.com/slackapi/bolt-js/blob/main/src/Assistant.ts#L21)

***

### threadStarted

```ts
threadStarted: 
  | AssistantThreadStartedMiddleware
  | AssistantThreadStartedMiddleware[];
```

Defined in: [src/Assistant.ts:22](https://github.com/slackapi/bolt-js/blob/main/src/Assistant.ts#L22)

***

### userMessage

```ts
userMessage: 
  | AssistantUserMessageMiddleware
  | AssistantUserMessageMiddleware[];
```

Defined in: [src/Assistant.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/Assistant.ts#L24)
