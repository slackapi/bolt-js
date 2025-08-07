[@slack/bolt](../index.md) / StaticSelectAction

# Interface: StaticSelectAction

Defined in: [src/types/actions/block-action.ts:57](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L57)

An action from a select menu with static options

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"static_select"`\>

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

Defined in: [src/types/actions/block-action.ts:64](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L64)

***

### initial\_option?

```ts
optional initial_option: Option;
```

Defined in: [src/types/actions/block-action.ts:62](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L62)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:63](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L63)

***

### selected\_option

```ts
selected_option: object;
```

Defined in: [src/types/actions/block-action.ts:58](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L58)

#### text

```ts
text: PlainTextElement;
```

#### value

```ts
value: string;
```

***

### type

```ts
type: "static_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
