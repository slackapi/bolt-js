# Interface: SlackViewMiddlewareArgs\<ViewActionType\>

Defined in: [src/types/view/index.ts:19](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L19)

Arguments which listeners and middleware receive to process a view submission event from Slack.

## Type Parameters

### ViewActionType

`ViewActionType` *extends* [`SlackViewAction`](../type-aliases/SlackViewAction.md) = [`SlackViewAction`](../type-aliases/SlackViewAction.md)

## Properties

### ack

```ts
ack: ViewAckFn<ViewActionType>;
```

Defined in: [src/types/view/index.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L23)

***

### body

```ts
body: ViewActionType;
```

Defined in: [src/types/view/index.ts:22](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L22)

***

### payload

```ts
payload: ViewOutput;
```

Defined in: [src/types/view/index.ts:20](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L20)

***

### respond

```ts
respond: RespondFn;
```

Defined in: [src/types/view/index.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L24)

***

### view

```ts
view: ViewOutput;
```

Defined in: [src/types/view/index.ts:21](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L21)
