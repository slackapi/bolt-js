[@slack/bolt](../index.md) / InteractiveMessage

# Interface: InteractiveMessage\<Action\>

Defined in: [src/types/actions/interactive-message.ts:32](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L32)

A Slack legacy interactive message action wrapped in the standard metadata.

This describes the entire JSON-encoded body of a request from Slack's legacy interactive messages.

## Type Parameters

### Action

`Action` *extends* [`InteractiveAction`](../type-aliases/InteractiveAction.md) = [`InteractiveAction`](../type-aliases/InteractiveAction.md)

## Properties

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/actions/interactive-message.ts:51](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L51)

***

### actions

```ts
actions: Action[];
```

Defined in: [src/types/actions/interactive-message.ts:35](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L35)

***

### attachment\_id?

```ts
optional attachment_id: string;
```

Defined in: [src/types/actions/interactive-message.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L52)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/actions/interactive-message.ts:34](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L34)

***

### channel

```ts
channel: object;
```

Defined in: [src/types/actions/interactive-message.ts:47](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L47)

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

Defined in: [src/types/actions/interactive-message.ts:65](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L65)

#### id

```ts
id: string;
```

#### name

```ts
name: string;
```

***

### is\_app\_unfurl?

```ts
optional is_app_unfurl: boolean;
```

Defined in: [src/types/actions/interactive-message.ts:56](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L56)

***

### is\_enterprise\_install?

```ts
optional is_enterprise_install: boolean;
```

Defined in: [src/types/actions/interactive-message.ts:64](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L64)

***

### message\_ts?

```ts
optional message_ts: string;
```

Defined in: [src/types/actions/interactive-message.ts:59](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L59)

***

### original\_message?

```ts
optional original_message: object;
```

Defined in: [src/types/actions/interactive-message.ts:61](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L61)

#### Index Signature

```ts
[key: string]: string
```

***

### response\_url

```ts
response_url: string;
```

Defined in: [src/types/actions/interactive-message.ts:54](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L54)

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

Defined in: [src/types/actions/interactive-message.ts:36](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L36)

***

### token

```ts
token: string;
```

Defined in: [src/types/actions/interactive-message.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L53)

***

### trigger\_id

```ts
trigger_id: string;
```

Defined in: [src/types/actions/interactive-message.ts:55](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L55)

***

### type

```ts
type: "interactive_message";
```

Defined in: [src/types/actions/interactive-message.ts:33](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L33)

***

### user

```ts
user: object;
```

Defined in: [src/types/actions/interactive-message.ts:42](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/interactive-message.ts#L42)

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
