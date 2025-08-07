[@slack/bolt](../index.md) / ActionConstraints

# Interface: ActionConstraints\<A\>

Defined in: [src/types/actions/index.ts:32](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L32)

## Type Parameters

### A

`A` *extends* [`SlackAction`](../type-aliases/SlackAction.md) = [`SlackAction`](../type-aliases/SlackAction.md)

## Properties

### action\_id?

```ts
optional action_id: A extends BlockAction<BlockElementAction> ? string | RegExp : never;
```

Defined in: [src/types/actions/index.ts:35](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L35)

***

### block\_id?

```ts
optional block_id: A extends BlockAction<BlockElementAction> ? string | RegExp : never;
```

Defined in: [src/types/actions/index.ts:34](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L34)

***

### callback\_id?

```ts
optional callback_id: Extract<A, {
  callback_id?: string;
}> extends any ? string | RegExp : never;
```

Defined in: [src/types/actions/index.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L38)

***

### type?

```ts
optional type: A["type"];
```

Defined in: [src/types/actions/index.ts:33](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L33)
