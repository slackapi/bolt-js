[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsCanvasesCreateArguments

# Interface: ConversationsCanvasesCreateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:71

## Extends

- `ChannelID`.`TokenOverridable`

## Properties

### channel\_id

```ts
channel_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:72

#### Description

Encoded channel ID.

#### Inherited from

```ts
ChannelID.channel_id
```

***

### document\_content?

```ts
optional document_content: DocumentContent;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:73

#### Description

Structure describing the type and contents of the Canvas being created.

***

### title?

```ts
optional title: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:75

#### Description

Title of the newly created canvas.

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
