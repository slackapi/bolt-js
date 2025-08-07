[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AssistantThreadsSetStatusArguments

# Interface: AssistantThreadsSetStatusArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:2

## Extends

- `TokenOverridable`

## Properties

### channel\_id

```ts
channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:4

#### Description

Channel ID containing the assistant thread.

***

### status

```ts
status: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:6

#### Description

Status of the assistant (e.g. 'is thinking...')

***

### thread\_ts

```ts
thread_ts: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/assistant.d.ts:8

#### Description

Message timestamp of the thread.

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
