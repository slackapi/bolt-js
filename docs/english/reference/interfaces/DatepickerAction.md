[@slack/bolt](../index.md) / DatepickerAction

# Interface: DatepickerAction

Defined in: [src/types/actions/block-action.ts:176](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L176)

An action from a date picker element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"datepicker"`\>

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

Defined in: [src/types/actions/block-action.ts:180](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L180)

***

### initial\_date?

```ts
optional initial_date: string;
```

Defined in: [src/types/actions/block-action.ts:178](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L178)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:179](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L179)

***

### selected\_date

```ts
selected_date: null | string;
```

Defined in: [src/types/actions/block-action.ts:177](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L177)

***

### type

```ts
type: "datepicker";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
