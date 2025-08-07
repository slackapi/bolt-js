[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminConversationsCreateArguments

# Type Alias: AdminConversationsCreateArguments

```ts
type AdminConversationsCreateArguments = TokenOverridable & WorkspaceAccess & object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/conversations.d.ts:48

## Type declaration

### description?

```ts
optional description: string;
```

#### Description

Description of the public or private channel to create.

### is\_private

```ts
is_private: boolean;
```

#### Description

When `true`, creates a private channel instead of a public channel.

### name

```ts
name: string;
```

#### Description

Name of the public or private channel to create.
