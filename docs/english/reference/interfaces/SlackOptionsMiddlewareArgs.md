[@slack/bolt](../index.md) / SlackOptionsMiddlewareArgs

# Interface: SlackOptionsMiddlewareArgs\<Source\>

Defined in: [src/types/options/index.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L8)

Arguments which listeners and middleware receive to process an options request from Slack

## Type Parameters

### Source

`Source` *extends* [`OptionsSource`](../type-aliases/OptionsSource.md) = [`OptionsSource`](../type-aliases/OptionsSource.md)

## Properties

### ack

```ts
ack: OptionsAckFn<Source>;
```

Defined in: [src/types/options/index.ts:12](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L12)

***

### body

```ts
body: OptionsPayloadFromType<Source>;
```

Defined in: [src/types/options/index.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L10)

***

### options

```ts
options: OptionsPayloadFromType<Source>;
```

Defined in: [src/types/options/index.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L11)

***

### payload

```ts
payload: OptionsPayloadFromType<Source>;
```

Defined in: [src/types/options/index.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L9)
