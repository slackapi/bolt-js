[@slack/bolt](../index.md) / MultiExternalSelectAction

# Interface: MultiExternalSelectAction

Defined in: [src/types/actions/block-action.ts:154](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L154)

An action from a multi select menu with external data source

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"multi_external_select"`\>

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

Defined in: [src/types/actions/block-action.ts:159](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L159)

***

### initial\_options?

```ts
optional initial_options: Option[];
```

Defined in: [src/types/actions/block-action.ts:156](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L156)

***

### min\_query\_length?

```ts
optional min_query_length: number;
```

Defined in: [src/types/actions/block-action.ts:158](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L158)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:157](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L157)

***

### selected\_options?

```ts
optional selected_options: Option[];
```

Defined in: [src/types/actions/block-action.ts:155](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L155)

***

### type

```ts
type: "multi_external_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
