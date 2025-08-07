[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatScheduleMessageArguments

# Type Alias: ChatScheduleMessageArguments

```ts
type ChatScheduleMessageArguments = TokenOverridable & MessageContents & object & ReplyInThread & Parse & LinkNames & AsUser & Metadata & Unfurls;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:144

## Type declaration

### post\_at

```ts
post_at: string | number;
```

#### Description

Unix EPOCH timestamp of time in future to send the message.
