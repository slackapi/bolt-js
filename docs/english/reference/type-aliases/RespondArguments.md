# RespondArguments

```ts
type RespondArguments = DistributiveOmit<ChatPostMessageArguments, "channel" | "text"> & object;
```

Defined in: [src/types/utilities.ts:36](https://github.com/slackapi/bolt-js/blob/main/src/types/utilities.ts#L36)

## Type Declaration

### delete\_original?

```ts
delete_original?: boolean;
```

### replace\_original?

```ts
replace_original?: boolean;
```

### response\_type?

```ts
response_type?: "in_channel" | "ephemeral";
```

Response URLs can be used to send ephemeral messages or in-channel messages using this argument

### text?

```ts
text?: string;
```

### thread\_ts?

```ts
thread_ts?: string;
```
