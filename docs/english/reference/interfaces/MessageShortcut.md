[@slack/bolt](../index.md) / MessageShortcut

# Interface: MessageShortcut

Defined in: [src/types/shortcuts/message-shortcut.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L7)

A Slack message action wrapped in the standard metadata.

This describes the entire JSON-encoded body of a request from Slack message actions.

## Properties

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:39](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L39)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L9)

***

### channel

```ts
channel: object;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L28)

#### id

```ts
id: string;
```

#### name

```ts
name: string;
```

***

### enterprise?

```ts
optional enterprise: object;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:43](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L43)

#### id

```ts
id: string;
```

#### name

```ts
name: string;
```

***

### is\_enterprise\_install?

```ts
optional is_enterprise_install: boolean;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:42](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L42)

***

### message

```ts
message: object;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:14](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L14)

#### Index Signature

```ts
[key: string]: any
```

#### text?

```ts
optional text: string;
```

#### ts

```ts
ts: string;
```

#### type

```ts
type: "message";
```

#### user?

```ts
optional user: string;
```

***

### message\_ts

```ts
message_ts: string;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L11)

***

### response\_url

```ts
response_url: string;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:12](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L12)

***

### team

```ts
team: 
  | null
  | {
  domain: string;
  enterprise_id?: string;
  enterprise_name?: string;
  id: string;
};
```

Defined in: [src/types/shortcuts/message-shortcut.ts:32](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L32)

***

### token

```ts
token: string;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:38](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L38)

***

### trigger\_id

```ts
trigger_id: string;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L10)

***

### type

```ts
type: "message_action";
```

Defined in: [src/types/shortcuts/message-shortcut.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L8)

***

### user

```ts
user: object;
```

Defined in: [src/types/shortcuts/message-shortcut.ts:22](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/message-shortcut.ts#L22)

#### id

```ts
id: string;
```

#### name

```ts
name: string;
```

#### team\_id?

```ts
optional team_id: string;
```

#### username?

```ts
optional username: string;
```
