# Interface: ButtonAction

Defined in: [src/types/actions/block-action.ts:49](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L49)

An action from a button element

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"button"`\>

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

Defined in: [src/types/actions/block-action.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L53)

***

### text

```ts
text: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:51](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L51)

***

### type

```ts
type: "button";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)

***

### url?

```ts
optional url?: string;
```

Defined in: [src/types/actions/block-action.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L52)

***

### value?

```ts
optional value?: string;
```

Defined in: [src/types/actions/block-action.ts:50](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L50)
