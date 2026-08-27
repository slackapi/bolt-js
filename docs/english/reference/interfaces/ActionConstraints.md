---
sidebar_label: "ActionConstraints"
---

[@slack/bolt](../index.md) / ActionConstraints

# Interface: ActionConstraints\<A\>

Defined in: [src/types/actions/index.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L28)

## Type Parameters

### A

`A` *extends* [`SlackAction`](../type-aliases/SlackAction.md) = [`SlackAction`](../type-aliases/SlackAction.md)

## Properties

### action\_id?

```ts
optional action_id?: A extends BlockAction<BlockElementAction> ? string | RegExp : never;
```

Defined in: [src/types/actions/index.ts:31](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L31)

***

### block\_id?

```ts
optional block_id?: A extends BlockAction<BlockElementAction> ? string | RegExp : never;
```

Defined in: [src/types/actions/index.ts:30](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L30)

***

### callback\_id?

```ts
optional callback_id?: Extract<A, {
  callback_id?: string;
}> extends any ? string | RegExp : never;
```

Defined in: [src/types/actions/index.ts:34](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L34)

***

### type?

```ts
optional type?: A["type"];
```

Defined in: [src/types/actions/index.ts:29](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L29)
