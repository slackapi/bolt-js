[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsOpenArguments

# Type Alias: ConversationsOpenArguments

```ts
type ConversationsOpenArguments = Channel | Users & TokenOverridable & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:111

## Type declaration

### prevent\_creation?

```ts
optional prevent_creation: boolean;
```

#### Description

Do not create a direct message or multi-person direct message.
This is used to see if there is an existing dm or mpdm.

### return\_im?

```ts
optional return_im: boolean;
```

#### Description

Indicates you want the full IM channel definition in the response.
