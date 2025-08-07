[@slack/bolt](../index.md) / ViewClosedAction

# Interface: ViewClosedAction

Defined in: [src/types/view/index.ts:82](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L82)

A Slack view_closed event wrapped in the standard metadata.

This describes the entire JSON-encoded body of a view_closed event.

## Extended by

- [`ViewWorkflowStepClosedAction`](ViewWorkflowStepClosedAction.md)

## Properties

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/view/index.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L96)

***

### enterprise?

```ts
optional enterprise: object;
```

Defined in: [src/types/view/index.ts:101](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L101)

#### id

```ts
id: string;
```

#### name

```ts
name: string;
```

***

### is\_cleared

```ts
is_cleared: boolean;
```

Defined in: [src/types/view/index.ts:98](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L98)

***

### is\_enterprise\_install?

```ts
optional is_enterprise_install: boolean;
```

Defined in: [src/types/view/index.ts:100](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L100)

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

Defined in: [src/types/view/index.ts:84](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L84)

***

### token

```ts
token: string;
```

Defined in: [src/types/view/index.ts:97](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L97)

***

### type

```ts
type: "view_closed";
```

Defined in: [src/types/view/index.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L83)

***

### user

```ts
user: object;
```

Defined in: [src/types/view/index.ts:90](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L90)

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

### view

```ts
view: ViewOutput;
```

Defined in: [src/types/view/index.ts:95](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L95)
