[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsInviteSharedArguments

# Type Alias: ConversationsInviteSharedArguments

```ts
type ConversationsInviteSharedArguments = Channel & TokenOverridable & Emails | UserIDs & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:81

## Type declaration

### external\_limited?

```ts
optional external_limited: boolean;
```

#### Description

Whether invite is to an external limited member. Defaults to `true`.
