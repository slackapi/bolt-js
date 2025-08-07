[@slack/bolt](../index.md) / SlackActionMiddlewareArgs

# Type Alias: SlackActionMiddlewareArgs\<Action\>

```ts
type SlackActionMiddlewareArgs<Action> = object & Action extends Exclude<SlackAction, 
  | DialogSubmitAction
  | WorkflowStepEdit> ? object : unknown;
```

Defined in: [src/types/actions/index.ts:50](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L50)

Arguments which listeners and middleware receive to process an action from Slack's Block Kit interactive components,
message actions, dialogs, or legacy interactive messages.

The type parameter `Action` represents the entire JSON-encoded request body from Slack. The generic type
`BlockAction<ElementAction>` can be used to create a type for this parameter based on an element's action type. In
this case `ElementAction` must extend `BasicElementAction`.

## Type declaration

### ack

```ts
ack: ActionAckFn<Action>;
```

### action

```ts
action: Action extends BlockAction<infer ElementAction> ? ElementAction : Action extends InteractiveMessage<infer InteractiveAction> ? InteractiveAction : Action;
```

### body

```ts
body: Action;
```

### complete?

```ts
optional complete: FunctionCompleteFn;
```

### fail?

```ts
optional fail: FunctionFailFn;
```

### inputs?

```ts
optional inputs: FunctionInputs;
```

### payload

```ts
payload: Action extends BlockAction<infer ElementAction> ? ElementAction : Action extends InteractiveMessage<infer InteractiveAction> ? InteractiveAction : Action;
```

### respond

```ts
respond: RespondFn;
```

## Type Parameters

### Action

`Action` *extends* [`SlackAction`](SlackAction.md) = [`SlackAction`](SlackAction.md)
