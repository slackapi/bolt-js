[@slack/bolt](../index.md) / SlackAction

# Type Alias: SlackAction

```ts
type SlackAction = 
  | BlockAction
  | InteractiveMessage
  | DialogSubmitAction
  | WorkflowStepEdit;
```

Defined in: [src/types/actions/index.ts:30](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/index.ts#L30)

All known actions from Slack's Block Kit interactive components, message actions, dialogs, and legacy interactive
messages.

TODO: BlockAction's default generic parameter (ElementAction) might be too specific to allow for this type to be used
as a constraint on SlackActionMiddlewareArgs' Action generic parameter.

If someone were to instantiate SlackActionMiddlewareArgs<BlockAction<SomeNewAction>>, would it work? We need it to
work as long as SomeNewAction implements BasicElementAction.

We don't want to substitute BlockAction with BlockAction<BasicElementAction> here because that means the completions
offered when no generic parameter is bound would be limited to BasicElementAction rather than the union of known
actions - ElementAction.
