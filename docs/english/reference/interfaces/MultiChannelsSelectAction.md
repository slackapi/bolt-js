# Interface: MultiChannelsSelectAction

Defined in: [src/types/actions/block-action.ts:152](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L152)

An action from a multi select menu with channels list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"multi_channels_select"`\>

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

Defined in: [src/types/actions/block-action.ts:156](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L156)

***

### initial\_channels?

```ts
optional initial_channels?: string[];
```

Defined in: [src/types/actions/block-action.ts:154](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L154)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:155](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L155)

***

### selected\_channels

```ts
selected_channels: string[];
```

Defined in: [src/types/actions/block-action.ts:153](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L153)

***

### type

```ts
type: "multi_channels_select";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
