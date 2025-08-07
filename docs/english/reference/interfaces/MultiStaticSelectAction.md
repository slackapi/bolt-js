[@slack/bolt](../index.md) / MultiStaticSelectAction

# Interface: MultiStaticSelectAction

Defined in: [src/types/actions/block-action.ts:70](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L70)

An action from a multi select menu with static options

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"multi_static_select"`\>

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

Defined in: [src/types/actions/block-action.ts:77](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L77)

***

### initial\_options?

```ts
optional initial_options: Option[];
```

Defined in: [src/types/actions/block-action.ts:75](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L75)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:76](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L76)

***

### selected\_options

```ts
selected_options: object[];
```

Defined in: [src/types/actions/block-action.ts:71](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L71)

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
type: "multi_static_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
