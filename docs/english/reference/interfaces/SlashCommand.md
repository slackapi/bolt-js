[@slack/bolt](../index.md) / SlashCommand

# Interface: SlashCommand

Defined in: [src/types/command/index.ts:20](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L20)

A Slack slash command

This describes the entire URL-encoded body of a request from Slack's slash commands.

## Extends

- [`StringIndexed`](../type-aliases/StringIndexed.md)

## Indexable

```ts
[key: string]: any
```

## Properties

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/command/index.ts:32](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L32)

***

### channel\_id

```ts
channel_id: string;
```

Defined in: [src/types/command/index.ts:30](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L30)

***

### channel\_name

```ts
channel_name: string;
```

Defined in: [src/types/command/index.ts:31](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L31)

***

### command

```ts
command: string;
```

Defined in: [src/types/command/index.ts:22](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L22)

***

### enterprise\_id?

```ts
optional enterprise_id: string;
```

Defined in: [src/types/command/index.ts:33](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L33)

***

### enterprise\_name?

```ts
optional enterprise_name: string;
```

Defined in: [src/types/command/index.ts:34](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L34)

***

### is\_enterprise\_install?

```ts
optional is_enterprise_install: string;
```

Defined in: [src/types/command/index.ts:36](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L36)

***

### response\_url

```ts
response_url: string;
```

Defined in: [src/types/command/index.ts:24](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L24)

***

### team\_domain

```ts
team_domain: string;
```

Defined in: [src/types/command/index.ts:29](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L29)

***

### team\_id

```ts
team_id: string;
```

Defined in: [src/types/command/index.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L28)

***

### text

```ts
text: string;
```

Defined in: [src/types/command/index.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L23)

***

### token

```ts
token: string;
```

Defined in: [src/types/command/index.ts:21](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L21)

***

### trigger\_id

```ts
trigger_id: string;
```

Defined in: [src/types/command/index.ts:25](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L25)

***

### user\_id

```ts
user_id: string;
```

Defined in: [src/types/command/index.ts:26](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L26)

***

### user\_name

```ts
user_name: string;
```

Defined in: [src/types/command/index.ts:27](https://github.com/slackapi/bolt-js/blob/main/src/types/command/index.ts#L27)
