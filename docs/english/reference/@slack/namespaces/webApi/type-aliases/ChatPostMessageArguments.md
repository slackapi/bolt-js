[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatPostMessageArguments

# Type Alias: ChatPostMessageArguments

```ts
type ChatPostMessageArguments = TokenOverridable & MessageContents & ReplyInThread & Authorship & Parse & LinkNames & Metadata & Unfurls & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:140

## Type declaration

### mrkdwn?

```ts
optional mrkdwn: boolean;
```

#### Description

Disable Slack markup parsing by setting to `false`. Enabled by default.
