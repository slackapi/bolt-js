[@slack/bolt](../index.md) / ConversationsSelectAction

# Interface: ConversationsSelectAction

Defined in: [src/types/actions/block-action.ts:103](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L103)

An action from a select menu with conversations list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"conversations_select"`\>

## Properties

### action\_id

```ts
action_id: string;
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`action_id`](BasicElementAction.md#action_id)

***

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/actions/block-action.ts:41](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L41)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`action_ts`](BasicElementAction.md#action_ts)

***

### block\_id

```ts
block_id: string;
```

Defined in: [src/types/actions/block-action.ts:39](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L39)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`block_id`](BasicElementAction.md#block_id)

***

### confirm?

```ts
optional confirm: Confirmation;
```

Defined in: [src/types/actions/block-action.ts:107](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L107)

***

### initial\_conversation?

```ts
optional initial_conversation: string;
```

Defined in: [src/types/actions/block-action.ts:105](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L105)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:106](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L106)

***

### selected\_conversation

```ts
selected_conversation: string;
```

Defined in: [src/types/actions/block-action.ts:104](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L104)

***

### type

```ts
type: "conversations_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
