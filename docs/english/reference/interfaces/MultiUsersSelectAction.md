[@slack/bolt](../index.md) / MultiUsersSelectAction

# Interface: MultiUsersSelectAction

Defined in: [src/types/actions/block-action.ts:93](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L93)

An action from a multi select menu with user list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"multi_users_select"`\>

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

Defined in: [src/types/actions/block-action.ts:97](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L97)

***

### initial\_users?

```ts
optional initial_users: string[];
```

Defined in: [src/types/actions/block-action.ts:95](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L95)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L96)

***

### selected\_users

```ts
selected_users: string[];
```

Defined in: [src/types/actions/block-action.ts:94](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L94)

***

### type

```ts
type: "multi_users_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
