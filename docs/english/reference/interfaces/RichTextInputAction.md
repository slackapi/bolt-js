---
sidebar_label: "RichTextInputAction"
---

[@slack/bolt](../index.md) / RichTextInputAction

# Interface: RichTextInputAction

Defined in: [src/types/actions/block-action.ts:240](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L240)

An action from a rich_text_input element (must use dispatch_action: true)

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"rich_text_input"`\>

## Properties

### action\_id

```ts
action_id: string;
```

Defined in: [src/types/actions/block-action.ts:42](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L42)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`action_id`](BasicElementAction.md#action_id)

***

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/actions/block-action.ts:43](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L43)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`action_ts`](BasicElementAction.md#action_ts)

***

### block\_id

```ts
block_id: string;
```

Defined in: [src/types/actions/block-action.ts:41](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L41)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`block_id`](BasicElementAction.md#block_id)

***

### rich\_text\_value

```ts
rich_text_value: RichTextBlock;
```

Defined in: [src/types/actions/block-action.ts:241](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L241)

***

### type

```ts
type: "rich_text_input";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
