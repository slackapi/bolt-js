[@slack/bolt](../index.md) / Receiver

# Interface: Receiver

Defined in: [src/types/receiver.ts:26](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L26)

## Methods

### init()

```ts
init(app): void;
```

Defined in: [src/types/receiver.ts:27](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L27)

#### Parameters

##### app

[`App`](../classes/App.md)

#### Returns

`void`

***

### start()

```ts
start(...args): Promise<unknown>;
```

Defined in: [src/types/receiver.ts:29](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L29)

#### Parameters

##### args

...`any`[]

#### Returns

`Promise`\<`unknown`\>

***

### stop()

```ts
stop(...args): Promise<unknown>;
```

Defined in: [src/types/receiver.ts:31](https://github.com/slackapi/bolt-js/blob/main/src/types/receiver.ts#L31)

#### Parameters

##### args

...`any`[]

#### Returns

`Promise`\<`unknown`\>
