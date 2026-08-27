[@slack/bolt](../index.md) / ConversationsSelectAction

# Interface: ConversationsSelectAction

Defined in: [src/types/actions/block-action.ts:122](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L122)

An action from a select menu with conversations list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"conversations_select"`\>

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

### confirm?

```ts
optional confirm?: Confirmation;
```

Defined in: [src/types/actions/block-action.ts:126](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L126)

***

### initial\_conversation?

```ts
optional initial_conversation?: string;
```

Defined in: [src/types/actions/block-action.ts:124](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L124)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:125](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L125)

***

### selected\_conversation

```ts
selected_conversation: string;
```

Defined in: [src/types/actions/block-action.ts:123](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L123)

***

### type

```ts
type: "conversations_select";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
