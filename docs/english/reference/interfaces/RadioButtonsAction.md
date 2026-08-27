[@slack/bolt](../index.md) / RadioButtonsAction

# Interface: RadioButtonsAction

Defined in: [src/types/actions/block-action.ts:215](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L215)

An action from a radio button element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"radio_buttons"`\>

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

Defined in: [src/types/actions/block-action.ts:218](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L218)

***

### initial\_option?

```ts
optional initial_option?: Option;
```

Defined in: [src/types/actions/block-action.ts:217](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L217)

***

### selected\_option

```ts
selected_option: Option | null;
```

Defined in: [src/types/actions/block-action.ts:216](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L216)

***

### type

```ts
type: "radio_buttons";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
