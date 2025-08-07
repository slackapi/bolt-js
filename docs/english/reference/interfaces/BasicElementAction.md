[@slack/bolt](../index.md) / BasicElementAction

# Interface: BasicElementAction\<T\>

Defined in: [src/types/actions/block-action.ts:37](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L37)

Any action from Slack's interactive elements

This type is used to represent actions that aren't known ahead of time. Each of the known element actions also
implement this interface.

## Extended by

- [`ButtonAction`](ButtonAction.md)
- [`StaticSelectAction`](StaticSelectAction.md)
- [`MultiStaticSelectAction`](MultiStaticSelectAction.md)
- [`UsersSelectAction`](UsersSelectAction.md)
- [`MultiUsersSelectAction`](MultiUsersSelectAction.md)
- [`ConversationsSelectAction`](ConversationsSelectAction.md)
- [`MultiConversationsSelectAction`](MultiConversationsSelectAction.md)
- [`ChannelsSelectAction`](ChannelsSelectAction.md)
- [`MultiChannelsSelectAction`](MultiChannelsSelectAction.md)
- [`ExternalSelectAction`](ExternalSelectAction.md)
- [`MultiExternalSelectAction`](MultiExternalSelectAction.md)
- [`OverflowAction`](OverflowAction.md)
- [`DatepickerAction`](DatepickerAction.md)
- [`TimepickerAction`](TimepickerAction.md)
- [`RadioButtonsAction`](RadioButtonsAction.md)
- [`CheckboxesAction`](CheckboxesAction.md)
- [`PlainTextInputAction`](PlainTextInputAction.md)
- [`RichTextInputAction`](RichTextInputAction.md)

## Type Parameters

### T

`T` *extends* `string` = `string`

## Properties

### action\_id

```ts
action_id: string;
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

***

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/actions/block-action.ts:41](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L41)

***

### block\_id

```ts
block_id: string;
```

Defined in: [src/types/actions/block-action.ts:39](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L39)

***

### type

```ts
type: T;
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)
