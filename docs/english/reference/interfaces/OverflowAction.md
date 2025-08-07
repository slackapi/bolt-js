[@slack/bolt](../index.md) / OverflowAction

# Interface: OverflowAction

Defined in: [src/types/actions/block-action.ts:165](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L165)

An action from an overflow menu element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"overflow"`\>

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

Defined in: [src/types/actions/block-action.ts:170](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L170)

***

### selected\_option

```ts
selected_option: object;
```

Defined in: [src/types/actions/block-action.ts:166](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L166)

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
type: "overflow";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
