[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AssistantThreadsSetTitleArguments

# Interface: AssistantThreadsSetTitleArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:26

## Extends

- `TokenOverridable`

## Properties

### channel\_id

```ts
channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:28

#### Description

Channel ID containing the assistant thread.

***

### thread\_ts

```ts
thread_ts: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:30

#### Description

Message timestamp of the thread.

***

### title

```ts
title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:32

#### Description

Title of the thread.

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
