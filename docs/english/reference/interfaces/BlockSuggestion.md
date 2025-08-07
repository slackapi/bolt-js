[@slack/bolt](../index.md) / BlockSuggestion

# Interface: BlockSuggestion

Defined in: [src/types/options/index.ts:46](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L46)

external data source in blocks

## Extends

- [`StringIndexed`](../type-aliases/StringIndexed.md)

## Indexable

```ts
[key: string]: any
```

## Properties

### action\_id

```ts
action_id: string;
```

Defined in: [src/types/options/index.ts:49](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L49)

***

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/options/index.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L52)

***

### block\_id

```ts
block_id: string;
```

Defined in: [src/types/options/index.ts:48](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L48)

***

### channel?

```ts
optional channel: object;
```

Defined in: [src/types/options/index.ts:59](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L59)

#### id

```ts
id: string;
```

#### name

```ts
name: string;
```

***

### container

```ts
container: StringIndexed;
```

Defined in: [src/types/options/index.ts:69](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L69)

***

### enterprise?

```ts
optional enterprise: object;
```

Defined in: [src/types/options/index.ts:74](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L74)

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

Defined in: [src/types/options/index.ts:73](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L73)

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

Defined in: [src/types/options/index.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L53)

***

### token

```ts
token: string;
```

Defined in: [src/types/options/index.ts:68](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L68)

***

### type

```ts
type: "block_suggestion";
```

Defined in: [src/types/options/index.ts:47](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L47)

***

### user

```ts
user: object;
```

Defined in: [src/types/options/index.ts:63](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L63)

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

Defined in: [src/types/options/index.ts:50](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L50)

***

### view?

```ts
optional view: ViewOutput;
```

Defined in: [src/types/options/index.ts:71](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L71)
