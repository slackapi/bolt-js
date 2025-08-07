[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatUpdateArguments

# Type Alias: ChatUpdateArguments

```ts
type ChatUpdateArguments = MessageContents & object & TokenOverridable & AsUser & LinkNames & Metadata & Parse & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:190

## Type declaration

### ts

```ts
ts: string;
```

#### Description

Timestamp of the message to be updated.

## Type declaration

### file\_ids?

```ts
optional file_ids: string[];
```

#### Description

Array of new file ids that will be sent with this message.

### reply\_broadcast?

```ts
optional reply_broadcast: boolean;
```

#### Description

Broadcast an existing thread reply to make it visible to everyone in the channel or conversation.
