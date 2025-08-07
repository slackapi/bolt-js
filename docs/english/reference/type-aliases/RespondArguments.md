[@slack/bolt](../index.md) / RespondArguments

# Type Alias: RespondArguments

```ts
type RespondArguments = DistributiveOmit<ChatPostMessageArguments, "channel" | "text"> & object;
```

Defined in: [src/types/utilities.ts:34](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L34)

## Type declaration

### delete\_original?

```ts
optional delete_original: boolean;
```

### replace\_original?

```ts
optional replace_original: boolean;
```

### response\_type?

```ts
optional response_type: "in_channel" | "ephemeral";
```

Response URLs can be used to send ephemeral messages or in-channel messages using this argument

### text?

```ts
optional text: string;
```
