[@slack/bolt](../index.md) / SlackShortcutMiddlewareArgs

# Type Alias: SlackShortcutMiddlewareArgs\<Shortcut\>

```ts
type SlackShortcutMiddlewareArgs<Shortcut> = object & Shortcut extends MessageShortcut ? object : unknown;
```

Defined in: [src/types/shortcuts/index.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/index.ts#L24)

Arguments which listeners and middleware receive to process a shortcut from Slack.

The type parameter `Shortcut` represents the entire JSON-encoded request body from Slack.

## Type declaration

### ack

```ts
ack: AckFn<void>;
```

### body

```ts
body: Shortcut;
```

### payload

```ts
payload: Shortcut;
```

### respond

```ts
respond: RespondFn;
```

### shortcut

```ts
shortcut: Shortcut;
```

## Type Parameters

### Shortcut

`Shortcut` *extends* [`SlackShortcut`](SlackShortcut.md) = [`SlackShortcut`](SlackShortcut.md)
