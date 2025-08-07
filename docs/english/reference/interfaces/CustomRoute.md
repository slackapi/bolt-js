[@slack/bolt](../index.md) / CustomRoute

# Interface: CustomRoute

Defined in: [src/receivers/custom-routes.ts:5](https://github.com/slackapi/bolt-js/blob/main/src/receivers/custom-routes.ts#L5)

## Properties

### handler()

```ts
handler: (req, res) => void;
```

Defined in: [src/receivers/custom-routes.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/receivers/custom-routes.ts#L8)

#### Parameters

##### req

`ParamsIncomingMessage`

##### res

`ServerResponse`

#### Returns

`void`

***

### method

```ts
method: string | string[];
```

Defined in: [src/receivers/custom-routes.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/receivers/custom-routes.ts#L7)

***

### path

```ts
path: string;
```

Defined in: [src/receivers/custom-routes.ts:6](https://github.com/slackapi/bolt-js/blob/main/src/receivers/custom-routes.ts#L6)
