[@slack/bolt](../index.md) / ReceiverEvent

# Interface: ReceiverEvent

Defined in: [src/types/receiver.ts:5](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L5)

## Properties

### ack

```ts
ack: AckFn<any>;
```

Defined in: [src/types/receiver.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L23)

***

### body

```ts
body: StringIndexed;
```

Defined in: [src/types/receiver.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L7)

***

### customProperties?

```ts
optional customProperties: StringIndexed;
```

Defined in: [src/types/receiver.ts:18](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L18)

***

### retryNum?

```ts
optional retryNum: number;
```

Defined in: [src/types/receiver.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L11)

***

### retryReason?

```ts
optional retryReason: string;
```

Defined in: [src/types/receiver.ts:15](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L15)
