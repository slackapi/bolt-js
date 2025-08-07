[@slack/bolt](../index.md) / DialogSuggestion

# Interface: DialogSuggestion

Defined in: [src/types/options/index.ts:119](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L119)

external data source in dialogs

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

Defined in: [src/types/options/index.ts:124](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L124)

***

### callback\_id

```ts
callback_id: string;
```

Defined in: [src/types/options/index.ts:123](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L123)

***

### channel?

```ts
optional channel: object;
```

Defined in: [src/types/options/index.ts:132](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L132)

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

Defined in: [src/types/options/index.ts:144](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L144)

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

Defined in: [src/types/options/index.ts:143](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L143)

***

### name

```ts
name: string;
```

Defined in: [src/types/options/index.ts:121](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L121)

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

Defined in: [src/types/options/index.ts:126](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L126)

***

### token

```ts
token: string;
```

Defined in: [src/types/options/index.ts:141](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L141)

***

### type

```ts
type: "dialog_suggestion";
```

Defined in: [src/types/options/index.ts:120](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L120)

***

### user

```ts
user: object;
```

Defined in: [src/types/options/index.ts:136](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L136)

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

Defined in: [src/types/options/index.ts:122](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L122)
