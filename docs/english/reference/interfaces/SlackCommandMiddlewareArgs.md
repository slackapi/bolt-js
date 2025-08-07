[@slack/bolt](../index.md) / SlackCommandMiddlewareArgs

# Interface: SlackCommandMiddlewareArgs

Defined in: [src/types/command/index.ts:6](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L6)

Arguments which listeners and middleware receive to process a slash command from Slack.

## Properties

### ack

```ts
ack: AckFn<string | RespondArguments>;
```

Defined in: [src/types/command/index.ts:12](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L12)

***

### body

```ts
body: SlashCommand;
```

Defined in: [src/types/command/index.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L9)

***

### command

```ts
command: SlashCommand;
```

Defined in: [src/types/command/index.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L8)

***

### payload

```ts
payload: SlashCommand;
```

Defined in: [src/types/command/index.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L7)

***

### respond

```ts
respond: RespondFn;
```

Defined in: [src/types/command/index.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L11)

***

### say

```ts
say: SayFn;
```

Defined in: [src/types/command/index.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L10)
