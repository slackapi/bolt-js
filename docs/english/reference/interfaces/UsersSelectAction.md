---
sidebar_label: "UsersSelectAction"
---

[@slack/bolt](../index.md) / UsersSelectAction

# Interface: UsersSelectAction

Defined in: [src/types/actions/block-action.ts:102](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L102)

An action from a select menu with user list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"users_select"`\>

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

Defined in: [src/types/actions/block-action.ts:106](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L106)

***

### initial\_user?

```ts
optional initial_user?: string;
```

Defined in: [src/types/actions/block-action.ts:104](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L104)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:105](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L105)

***

### selected\_user

```ts
selected_user: string;
```

Defined in: [src/types/actions/block-action.ts:103](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L103)

***

### type

```ts
type: "users_select";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
