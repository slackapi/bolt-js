[@slack/bolt](../index.md) / UsersSelectAction

# Interface: UsersSelectAction

Defined in: [src/types/actions/block-action.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L83)

An action from a select menu with user list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"users_select"`\>

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

Defined in: [src/types/actions/block-action.ts:87](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L87)

***

### initial\_user?

```ts
optional initial_user: string;
```

Defined in: [src/types/actions/block-action.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L85)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:86](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L86)

***

### selected\_user

```ts
selected_user: string;
```

Defined in: [src/types/actions/block-action.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L84)

***

### type

```ts
type: "users_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
