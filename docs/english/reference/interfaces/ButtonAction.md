[@slack/bolt](../index.md) / ButtonAction

# Interface: ButtonAction

Defined in: [src/types/actions/block-action.ts:47](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L47)

An action from a button element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"button"`\>

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

Defined in: [src/types/actions/block-action.ts:51](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L51)

***

### text

```ts
text: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:49](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L49)

***

### type

```ts
type: "button";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)

***

### url?

```ts
optional url: string;
```

Defined in: [src/types/actions/block-action.ts:50](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L50)

***

### value?

```ts
optional value: string;
```

Defined in: [src/types/actions/block-action.ts:48](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L48)
