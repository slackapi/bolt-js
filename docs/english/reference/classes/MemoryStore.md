[@slack/bolt](../index.md) / MemoryStore

# Class: MemoryStore\<ConversationState\>

Defined in: [src/conversation-store.ts:21](https://github.com/slackapi/bolt-js/blob/main/src/conversation-store.ts#L21)

Default implementation of ConversationStore, which stores data in memory.

This should not be used in situations where there is more than once instance of the app running because state will
not be shared amongst the processes.

## Type Parameters

### ConversationState

`ConversationState` = `any`

## Implements

- [`ConversationStore`](../interfaces/ConversationStore.md)\<`ConversationState`\>

## Constructors

### Constructor

```ts
new MemoryStore<ConversationState>(): MemoryStore<ConversationState>;
```

#### Returns

`MemoryStore`\<`ConversationState`\>

## Methods

### get()

```ts
get(conversationId): Promise<ConversationState>;
```

Defined in: [src/conversation-store.ts:31](https://github.com/slackapi/bolt-js/blob/main/src/conversation-store.ts#L31)

#### Parameters

##### conversationId

`string`

#### Returns

`Promise`\<`ConversationState`\>

#### Implementation of

[`ConversationStore`](../interfaces/ConversationStore.md).[`get`](../interfaces/ConversationStore.md#get)

***

### set()

```ts
set(
   conversationId, 
   value, 
expiresAt?): Promise<void>;
```

Defined in: [src/conversation-store.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/conversation-store.ts#L24)

#### Parameters

##### conversationId

`string`

##### value

`ConversationState`

##### expiresAt?

`number`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ConversationStore`](../interfaces/ConversationStore.md).[`set`](../interfaces/ConversationStore.md#set)
