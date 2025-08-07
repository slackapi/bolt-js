[@slack/bolt](../index.md) / TimepickerAction

# Interface: TimepickerAction

Defined in: [src/types/actions/block-action.ts:186](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L186)

An action from a time picker element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"timepicker"`\>

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

Defined in: [src/types/actions/block-action.ts:190](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L190)

***

### initial\_time?

```ts
optional initial_time: string;
```

Defined in: [src/types/actions/block-action.ts:188](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L188)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:189](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L189)

***

### selected\_time

```ts
selected_time: null | string;
```

Defined in: [src/types/actions/block-action.ts:187](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L187)

***

### type

```ts
type: "timepicker";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
