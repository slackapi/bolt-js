# Interface: StaticSelectAction

Defined in: [src/types/actions/block-action.ts:76](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L76)

An action from a select menu with static options

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"static_select"`\>

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

Defined in: [src/types/actions/block-action.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L83)

***

### initial\_option?

```ts
optional initial_option?: Option;
```

Defined in: [src/types/actions/block-action.ts:81](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L81)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:82](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L82)

***

### selected\_option

```ts
selected_option: object;
```

Defined in: [src/types/actions/block-action.ts:77](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L77)

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

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
