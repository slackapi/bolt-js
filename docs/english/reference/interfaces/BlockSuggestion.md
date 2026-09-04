# BlockSuggestion

Defined in: [src/types/options/index.ts:45](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L45)

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

Defined in: [src/types/options/index.ts:48](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L48)

***

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/options/index.ts:51](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L51)

***

### block\_id

```ts
block_id: string;
```

Defined in: [src/types/options/index.ts:47](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L47)

***

### channel?

```ts
optional channel?: object;
```

Defined in: [src/types/options/index.ts:58](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L58)

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

Defined in: [src/types/options/index.ts:68](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L68)

***

### enterprise?

```ts
optional enterprise?: object;
```

Defined in: [src/types/options/index.ts:73](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L73)

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
optional is_enterprise_install?: boolean;
```

Defined in: [src/types/options/index.ts:72](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L72)

***

### team

```ts
team: 
  | {
  domain: string;
  enterprise_id?: string;
  enterprise_name?: string;
  id: string;
}
  | null;
```

Defined in: [src/types/options/index.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L52)

***

### token

```ts
token: string;
```

Defined in: [src/types/options/index.ts:67](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L67)

***

### type

```ts
type: "block_suggestion";
```

Defined in: [src/types/options/index.ts:46](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L46)

***

### user

```ts
user: object;
```

Defined in: [src/types/options/index.ts:62](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L62)

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
optional team_id?: string;
```

***

### value

```ts
value: string;
```

Defined in: [src/types/options/index.ts:49](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L49)

***

### view?

```ts
optional view?: ViewOutput;
```

Defined in: [src/types/options/index.ts:70](https://github.com/slackapi/bolt-js/blob/main/src/types/options/index.ts#L70)
