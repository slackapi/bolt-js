[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CanvasesAccessDeleteArguments

# Interface: CanvasesAccessDeleteArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:49

## Extends

- `CanvasID`.`Partial`\<`ChannelIDs`\>.`TokenOverridable`.`Partial`\<`UserIDs`\>

## Properties

### canvas\_id

```ts
canvas_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:5

#### Description

Encoded ID of the canvas.

#### Inherited from

```ts
CanvasID.canvas_id
```

***

### channel\_ids?

```ts
optional channel_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:68

#### Description

An array of channel IDs (must include at least one ID).

#### Inherited from

[`AdminConversationsBulkArchiveArguments`](AdminConversationsBulkArchiveArguments.md).[`channel_ids`](AdminConversationsBulkArchiveArguments.md#channel_ids)

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
