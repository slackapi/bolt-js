[@slack/bolt](../index.md) / ConversationStore

# Interface: ConversationStore\<ConversationState\>

Defined in: [src/conversation-store.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/conversation-store.ts#L8)

Storage backend used by the conversation context middleware

## Type Parameters

### ConversationState

`ConversationState` = `any`

## Methods

### get()

```ts
get(conversationId): Promise<ConversationState>;
```

Defined in: [src/conversation-store.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/conversation-store.ts#L11)

#### Parameters

##### conversationId

`string`

#### Returns

`Promise`\<`ConversationState`\>

***

### set()

```ts
set(
   conversationId, 
   value, 
expiresAt?): Promise<unknown>;
```

Defined in: [src/conversation-store.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/conversation-store.ts#L10)

#### Parameters

##### conversationId

`string`

##### value

`ConversationState`

##### expiresAt?

`number`

#### Returns

`Promise`\<`unknown`\>
