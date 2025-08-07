[@slack/bolt](../index.md) / matchConstraints

# Function: matchConstraints()

```ts
function matchConstraints(constraints): Middleware<
  | {
  ack:   | AckFn<void>
     | AckFn<string | SayArguments>
     | AckFn<DialogValidation>;
  action:   | DialogSubmitAction
     | WorkflowStepEdit
     | BlockElementAction
     | InteractiveAction;
  body: SlackAction;
  complete?: FunctionCompleteFn;
  fail?: FunctionFailFn;
  inputs?: FunctionInputs;
  payload:   | DialogSubmitAction
     | WorkflowStepEdit
     | BlockElementAction
     | InteractiveAction;
  respond: RespondFn;
}
  | SlackOptionsMiddlewareArgs<"interactive_message" | "block_suggestion" | "dialog_suggestion">
| SlackViewMiddlewareArgs<SlackViewAction>>;
```

Defined in: [src/middleware/builtin.ts:142](https://github.com/slackapi/bolt-js/blob/main/src/middleware/builtin.ts#L142)

Middleware that checks for matches given constraints

## Parameters

### constraints

[`ActionConstraints`](../interfaces/ActionConstraints.md)\<[`SlackAction`](../type-aliases/SlackAction.md)\> | [`ViewConstraints`](../interfaces/ViewConstraints.md) | [`ShortcutConstraints`](../interfaces/ShortcutConstraints.md)\<[`SlackShortcut`](../type-aliases/SlackShortcut.md)\> | [`OptionsConstraints`](../interfaces/OptionsConstraints.md)\<[`SlackOptions`](../type-aliases/SlackOptions.md)\>

## Returns

[`Middleware`](../type-aliases/Middleware.md)\<
  \| \{
  `ack`:   \| [`AckFn`](../type-aliases/AckFn.md)\<`void`\>
     \| [`AckFn`](../type-aliases/AckFn.md)\<`string` \| [`SayArguments`](../type-aliases/SayArguments.md)\>
     \| [`AckFn`](../type-aliases/AckFn.md)\<[`DialogValidation`](../interfaces/DialogValidation.md)\>;
  `action`:   \| [`DialogSubmitAction`](../interfaces/DialogSubmitAction.md)
     \| [`WorkflowStepEdit`](../interfaces/WorkflowStepEdit.md)
     \| [`BlockElementAction`](../type-aliases/BlockElementAction.md)
     \| [`InteractiveAction`](../type-aliases/InteractiveAction.md);
  `body`: [`SlackAction`](../type-aliases/SlackAction.md);
  `complete?`: `FunctionCompleteFn`;
  `fail?`: `FunctionFailFn`;
  `inputs?`: [`FunctionInputs`](../type-aliases/FunctionInputs.md);
  `payload`:   \| [`DialogSubmitAction`](../interfaces/DialogSubmitAction.md)
     \| [`WorkflowStepEdit`](../interfaces/WorkflowStepEdit.md)
     \| [`BlockElementAction`](../type-aliases/BlockElementAction.md)
     \| [`InteractiveAction`](../type-aliases/InteractiveAction.md);
  `respond`: [`RespondFn`](../type-aliases/RespondFn.md);
\}
  \| [`SlackOptionsMiddlewareArgs`](../interfaces/SlackOptionsMiddlewareArgs.md)\<`"interactive_message"` \| `"block_suggestion"` \| `"dialog_suggestion"`\>
  \| [`SlackViewMiddlewareArgs`](../interfaces/SlackViewMiddlewareArgs.md)\<[`SlackViewAction`](../type-aliases/SlackViewAction.md)\>\>
