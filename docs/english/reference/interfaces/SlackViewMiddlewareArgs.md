[@slack/bolt](../index.md) / SlackViewMiddlewareArgs

# Interface: SlackViewMiddlewareArgs\<ViewActionType\>

Defined in: [src/types/view/index.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L23)

Arguments which listeners and middleware receive to process a view submission event from Slack.

## Type Parameters

### ViewActionType

`ViewActionType` *extends* [`SlackViewAction`](../type-aliases/SlackViewAction.md) = [`SlackViewAction`](../type-aliases/SlackViewAction.md)

## Properties

### ack

```ts
ack: ViewAckFn<ViewActionType>;
```

Defined in: [src/types/view/index.ts:27](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L27)

***

### body

```ts
body: ViewActionType;
```

Defined in: [src/types/view/index.ts:26](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L26)

***

### payload

```ts
payload: ViewOutput;
```

Defined in: [src/types/view/index.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L24)

***

### respond

```ts
respond: RespondFn;
```

Defined in: [src/types/view/index.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L28)

***

### view

```ts
view: ViewOutput;
```

Defined in: [src/types/view/index.ts:25](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L25)
