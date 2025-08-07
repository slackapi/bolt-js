[@slack/bolt](../index.md) / MultiConversationsSelectAction

# Interface: MultiConversationsSelectAction

Defined in: [src/types/actions/block-action.ts:113](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L113)

An action from a multi select menu with conversations list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"multi_conversations_select"`\>

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

Defined in: [src/types/actions/block-action.ts:117](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L117)

***

### initial\_conversations?

```ts
optional initial_conversations: string[];
```

Defined in: [src/types/actions/block-action.ts:115](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L115)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:116](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L116)

***

### selected\_conversations

```ts
selected_conversations: string[];
```

Defined in: [src/types/actions/block-action.ts:114](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L114)

***

### type

```ts
type: "multi_conversations_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
