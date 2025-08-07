[@slack/bolt](../index.md) / BlockElementAction

# Type Alias: BlockElementAction

```ts
type BlockElementAction = 
  | ButtonAction
  | UsersSelectAction
  | MultiUsersSelectAction
  | StaticSelectAction
  | MultiStaticSelectAction
  | ConversationsSelectAction
  | MultiConversationsSelectAction
  | ChannelsSelectAction
  | MultiChannelsSelectAction
  | ExternalSelectAction
  | MultiExternalSelectAction
  | OverflowAction
  | DatepickerAction
  | TimepickerAction
  | RadioButtonsAction
  | CheckboxesAction
  | PlainTextInputAction
  | RichTextInputAction;
```

Defined in: [src/types/actions/block-action.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L11)

All known actions from in Slack's interactive elements

This is a discriminated union. The discriminant is the `type` property.
