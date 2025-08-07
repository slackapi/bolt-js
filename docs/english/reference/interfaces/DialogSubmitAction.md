[@slack/bolt](../index.md) / DialogSubmitAction

# Interface: DialogSubmitAction

Defined in: [src/types/actions/dialog-action.ts:6](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L6)

A Slack dialog submit action wrapped in the standard metadata.

This describes the entire JSON-encoded body of a request from Slack dialogs.

## Properties

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/actions/dialog-action.ts:26](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L26)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/actions/dialog-action.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L8)

***

### channel

```ts
channel: object;
```

Defined in: [src/types/actions/dialog-action.ts:22](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L22)

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

Defined in: [src/types/actions/dialog-action.ts:32](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L32)

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

Defined in: [src/types/actions/dialog-action.ts:31](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L31)

***

### response\_url

```ts
response_url: string;
```

Defined in: [src/types/actions/dialog-action.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L28)

***

### state

```ts
state: string;
```

Defined in: [src/types/actions/dialog-action.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L10)

***

### submission

```ts
submission: object;
```

Defined in: [src/types/actions/dialog-action.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L9)

#### Index Signature

```ts
[name: string]: string
```

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

Defined in: [src/types/actions/dialog-action.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L11)

***

### token

```ts
token: string;
```

Defined in: [src/types/actions/dialog-action.ts:27](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L27)

***

### type

```ts
type: "dialog_submission";
```

Defined in: [src/types/actions/dialog-action.ts:7](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L7)

***

### user

```ts
user: object;
```

Defined in: [src/types/actions/dialog-action.ts:17](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/dialog-action.ts#L17)

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
