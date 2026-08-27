---
sidebar_label: "TimepickerAction"
---

[@slack/bolt](../index.md) / TimepickerAction

# Interface: TimepickerAction

Defined in: [src/types/actions/block-action.ts:205](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L205)

An action from a time picker element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"timepicker"`\>

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

Defined in: [src/types/actions/block-action.ts:209](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L209)

***

### initial\_time?

```ts
optional initial_time?: string;
```

Defined in: [src/types/actions/block-action.ts:207](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L207)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:208](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L208)

***

### selected\_time

```ts
selected_time: string | null;
```

Defined in: [src/types/actions/block-action.ts:206](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L206)

***

### type

```ts
type: "timepicker";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
