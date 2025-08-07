[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AssistantThreadsSetSuggestedPromptsArguments

# Interface: AssistantThreadsSetSuggestedPromptsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:10

## Extends

- `TokenOverridable`

## Properties

### channel\_id

```ts
channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:12

#### Description

Channel ID containing the assistant thread.

***

### prompts

```ts
prompts: [AssistantPrompt, ...AssistantPrompt[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:14

#### Description

Prompt suggestions that appear when opening assistant thread.

***

### thread\_ts

```ts
thread_ts: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:16

#### Description

Message timestamp of the thread.

***

### title?

```ts
optional title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:18

#### Description

Title for the prompts.

***

### token?

```ts
optional token: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:37

#### Description

Overridable authentication token bearing required scopes.

#### Inherited from

```ts
TokenOverridable.token
```
