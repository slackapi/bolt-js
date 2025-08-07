[@slack/bolt](../index.md) / ExternalSelectAction

# Interface: ExternalSelectAction

Defined in: [src/types/actions/block-action.ts:143](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L143)

An action from a select menu with external data source

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"external_select"`\>

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

Defined in: [src/types/actions/block-action.ts:148](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L148)

***

### initial\_option?

```ts
optional initial_option: Option;
```

Defined in: [src/types/actions/block-action.ts:145](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L145)

***

### min\_query\_length?

```ts
optional min_query_length: number;
```

Defined in: [src/types/actions/block-action.ts:147](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L147)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:146](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L146)

***

### selected\_option?

```ts
optional selected_option: Option;
```

Defined in: [src/types/actions/block-action.ts:144](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L144)

***

### type

```ts
type: "external_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
