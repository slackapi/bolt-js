[@slack/bolt](../index.md) / SayArguments

# Type Alias: SayArguments

```ts
type SayArguments = DistributiveOmit<ChatPostMessageArguments, "channel"> & object;
```

Defined in: [src/types/utilities.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L28)

## Type declaration

### channel?

```ts
optional channel: string;
```
