[@slack/bolt](../index.md) / GlobalShortcut

# Interface: GlobalShortcut

Defined in: [src/types/shortcuts/global-shortcut.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L7)

A Slack global shortcut wrapped in the standard metadata.

This describes the entire JSON-encoded body of a request from Slack global shortcuts.

## Properties

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/shortcuts/global-shortcut.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L24)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/shortcuts/global-shortcut.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L9)

***

### enterprise?

```ts
optional enterprise: object;
```

Defined in: [src/types/shortcuts/global-shortcut.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L28)

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

Defined in: [src/types/shortcuts/global-shortcut.ts:27](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L27)

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

Defined in: [src/types/shortcuts/global-shortcut.ts:17](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L17)

***

### token

```ts
token: string;
```

Defined in: [src/types/shortcuts/global-shortcut.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L23)

***

### trigger\_id

```ts
trigger_id: string;
```

Defined in: [src/types/shortcuts/global-shortcut.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L10)

***

### type

```ts
type: "shortcut";
```

Defined in: [src/types/shortcuts/global-shortcut.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L8)

***

### user

```ts
user: object;
```

Defined in: [src/types/shortcuts/global-shortcut.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/shortcuts/global-shortcut.ts#L11)

#### id

```ts
id: string;
```

#### team\_id

```ts
team_id: string;
```

#### username

```ts
username: string;
```
