[@slack/bolt](../index.md) / DatepickerAction

# Interface: DatepickerAction

Defined in: [src/types/actions/block-action.ts:195](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L195)

An action from a date picker element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"datepicker"`\>

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

Defined in: [src/types/actions/block-action.ts:199](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L199)

***

### initial\_date?

```ts
optional initial_date?: string;
```

Defined in: [src/types/actions/block-action.ts:197](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L197)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:198](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L198)

***

### selected\_date

```ts
selected_date: string | null;
```

Defined in: [src/types/actions/block-action.ts:196](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L196)

***

### type

```ts
type: "datepicker";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
