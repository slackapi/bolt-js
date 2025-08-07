[@slack/bolt](../index.md) / ChannelsSelectAction

# Interface: ChannelsSelectAction

Defined in: [src/types/actions/block-action.ts:123](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L123)

An action from a select menu with channels list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"channels_select"`\>

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

Defined in: [src/types/actions/block-action.ts:127](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L127)

***

### initial\_channel?

```ts
optional initial_channel: string;
```

Defined in: [src/types/actions/block-action.ts:125](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L125)

***

### placeholder?

```ts
optional placeholder: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:126](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L126)

***

### selected\_channel

```ts
selected_channel: string;
```

Defined in: [src/types/actions/block-action.ts:124](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L124)

***

### type

```ts
type: "channels_select";
```

Defined in: [src/types/actions/block-action.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L38)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
