[@slack/bolt](../index.md) / CheckboxesAction

# Interface: CheckboxesAction

Defined in: [src/types/actions/block-action.ts:205](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L205)

An action from a checkboxes element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"checkboxes"`\>

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

Defined in: [src/types/actions/block-action.ts:208](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L208)

***

### initial\_options?

```ts
optional initial_options: Option[];
```

Defined in: [src/types/actions/block-action.ts:207](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L207)

***

### selected\_options

```ts
selected_options: Option[];
```

Defined in: [src/types/actions/block-action.ts:206](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L206)

***

### type

```ts
type: "checkboxes";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
