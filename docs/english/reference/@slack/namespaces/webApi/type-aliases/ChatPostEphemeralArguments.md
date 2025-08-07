[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ChatPostEphemeralArguments

# Type Alias: ChatPostEphemeralArguments

```ts
type ChatPostEphemeralArguments = TokenOverridable & MessageContents & object & Authorship & Parse & LinkNames & Partial<ThreadTS>;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/chat.d.ts:133

## Type declaration

### user

```ts
user: string;
```

#### Description

`id` of the user who will receive the ephemeral message.
The user should be in the channel specified by the `channel` argument.
