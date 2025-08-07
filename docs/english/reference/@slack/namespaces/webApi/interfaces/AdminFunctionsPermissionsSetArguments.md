[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminFunctionsPermissionsSetArguments

# Interface: AdminFunctionsPermissionsSetArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:12

## Extends

- `TokenOverridable`.`Partial`\<`UserIDs`\>

## Properties

### function\_id

```ts
function_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:14

#### Description

The function ID to set permissions for.

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

***

### user\_ids?

```ts
optional user_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:76

#### Description

List of encoded user IDs.

#### Inherited from

[`AdminConversationsInviteArguments`](AdminConversationsInviteArguments.md).[`user_ids`](AdminConversationsInviteArguments.md#user_ids)

***

### visibility

```ts
visibility: "everyone" | "app_collaborators" | "named_entities" | "no_one";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:16

#### Description

The function visibility.
