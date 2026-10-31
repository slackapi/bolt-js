# MultiConversationsSelectAction

Defined in: [src/types/actions/block-action.ts:132](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L132)

An action from a multi select menu with conversations list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"multi_conversations_select"`\>

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

Defined in: [src/types/actions/block-action.ts:136](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L136)

***

### initial\_conversations?

```ts
optional initial_conversations?: string[];
```

Defined in: [src/types/actions/block-action.ts:134](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L134)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:135](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L135)

***

### selected\_conversations

```ts
selected_conversations: string[];
```

Defined in: [src/types/actions/block-action.ts:133](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L133)

***

### type

```ts
type: "multi_conversations_select";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
