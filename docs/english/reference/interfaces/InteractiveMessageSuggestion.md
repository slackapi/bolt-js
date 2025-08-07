[@slack/bolt](../index.md) / InteractiveMessageSuggestion

# Interface: InteractiveMessageSuggestion

Defined in: [src/types/options/index.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L83)

external data source in attachments

## Extends

- [`StringIndexed`](../type-aliases/StringIndexed.md)

## Indexable

```ts
[key: string]: any
```

## Properties

### action\_ts

```ts
action_ts: string;
```

Defined in: [src/types/options/index.ts:88](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L88)

***

### attachment\_id

```ts
attachment_id: string;
```

Defined in: [src/types/options/index.ts:90](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L90)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/options/index.ts:87](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L87)

***

### channel?

```ts
optional channel: object;
```

Defined in: [src/types/options/index.ts:98](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L98)

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

Defined in: [src/types/options/index.ts:110](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L110)

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

Defined in: [src/types/options/index.ts:109](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L109)

***

### message\_ts

```ts
message_ts: string;
```

Defined in: [src/types/options/index.ts:89](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L89)

***

### name

```ts
name: string;
```

Defined in: [src/types/options/index.ts:85](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L85)

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

Defined in: [src/types/options/index.ts:92](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L92)

***

### token

```ts
token: string;
```

Defined in: [src/types/options/index.ts:107](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L107)

***

### type

```ts
type: "interactive_message";
```

Defined in: [src/types/options/index.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L84)

***

### user

```ts
user: object;
```

Defined in: [src/types/options/index.ts:102](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L102)

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

***

### value

```ts
value: string;
```

Defined in: [src/types/options/index.ts:86](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L86)
