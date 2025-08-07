[@slack/bolt](../index.md) / RequestVerificationOptions

# Interface: RequestVerificationOptions

Defined in: [src/receivers/HTTPModuleFunctions.ts:227](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPModuleFunctions.ts#L227)

## Properties

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [src/receivers/HTTPModuleFunctions.ts:228](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPModuleFunctions.ts#L228)

***

### logger?

```ts
optional logger: Logger;
```

Defined in: [src/receivers/HTTPModuleFunctions.ts:231](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPModuleFunctions.ts#L231)

***

### nowMilliseconds()?

```ts
optional nowMilliseconds: () => number;
```

Defined in: [src/receivers/HTTPModuleFunctions.ts:230](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPModuleFunctions.ts#L230)

#### Returns

`number`

***

### signingSecret

```ts
signingSecret: string;
```

Defined in: [src/receivers/HTTPModuleFunctions.ts:229](https://github.com/slackapi/bolt-js/blob/main/src/receivers/HTTPModuleFunctions.ts#L229)
