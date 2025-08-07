[@slack/bolt](../index.md) / OptionsConstraints

# Interface: OptionsConstraints\<A\>

Defined in: [src/types/options/index.ts:18](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L18)

## Type Parameters

### A

`A` *extends* [`SlackOptions`](../type-aliases/SlackOptions.md) = [`SlackOptions`](../type-aliases/SlackOptions.md)

## Properties

### action\_id?

```ts
optional action_id: A extends SlackOptions ? string | RegExp : never;
```

Defined in: [src/types/options/index.ts:21](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L21)

***

### block\_id?

```ts
optional block_id: A extends SlackOptions ? string | RegExp : never;
```

Defined in: [src/types/options/index.ts:20](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L20)

***

### callback\_id?

```ts
optional callback_id: Extract<A, {
  callback_id?: string;
}> extends any ? string | RegExp : never;
```

Defined in: [src/types/options/index.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L23)

***

### type?

```ts
optional type: A["type"];
```

Defined in: [src/types/options/index.ts:19](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L19)
