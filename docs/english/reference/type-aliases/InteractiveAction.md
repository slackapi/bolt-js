[@slack/bolt](../index.md) / InteractiveAction

# Type Alias: InteractiveAction

```ts
type InteractiveAction = 
  | ButtonClick
  | MenuSelect;
```

Defined in: [src/types/actions/interactive-message.ts:5](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L5)

All actions which Slack delivers from legacy interactive messages. The full body of these actions are represented
as [[InteractiveMessage]].
