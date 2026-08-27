---
sidebar_label: "ChannelsSelectAction"
---

[@slack/bolt](../index.md) / ChannelsSelectAction

# Interface: ChannelsSelectAction

Defined in: [src/types/actions/block-action.ts:142](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L142)

An action from a select menu with channels list

## Extends

- [`BasicElementAction`](BasicElementAction.md)\<`"channels_select"`\>

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

Defined in: [src/types/actions/block-action.ts:146](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L146)

***

### initial\_channel?

```ts
optional initial_channel?: string;
```

Defined in: [src/types/actions/block-action.ts:144](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L144)

***

### placeholder?

```ts
optional placeholder?: PlainTextElement;
```

Defined in: [src/types/actions/block-action.ts:145](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L145)

***

### selected\_channel

```ts
selected_channel: string;
```

Defined in: [src/types/actions/block-action.ts:143](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L143)

***

### type

```ts
type: "channels_select";
```

Defined in: [src/types/actions/block-action.ts:40](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L40)

#### Inherited from

[`BasicElementAction`](BasicElementAction.md).[`type`](BasicElementAction.md#type)
