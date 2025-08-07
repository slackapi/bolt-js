[@slack/bolt](../index.md) / RadioButtonsAction

# Interface: RadioButtonsAction

Defined in: [src/types/actions/block-action.ts:196](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L196)

An action from a radio button element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"radio_buttons"`\>

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

Defined in: [src/types/actions/block-action.ts:199](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L199)

***

### initial\_option?

```ts
optional initial_option: Option;
```

Defined in: [src/types/actions/block-action.ts:198](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L198)

***

### selected\_option

```ts
selected_option: null | Option;
```

Defined in: [src/types/actions/block-action.ts:197](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L197)

***

### type

```ts
type: "radio_buttons";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
