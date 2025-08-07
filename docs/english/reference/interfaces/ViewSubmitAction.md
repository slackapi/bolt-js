[@slack/bolt](../index.md) / ViewSubmitAction

# Interface: ViewSubmitAction

Defined in: [src/types/view/index.ts:51](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L51)

A Slack view_submission event wrapped in the standard metadata.

This describes the entire JSON-encoded body of a view_submission event.

## Extended by

- [`ViewWorkflowStepSubmitAction`](ViewWorkflowStepSubmitAction.md)

## Properties

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/view/index.ts:65](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L65)

***

### enterprise?

```ts
optional enterprise: object;
```

Defined in: [src/types/view/index.ts:70](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L70)

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

Defined in: [src/types/view/index.ts:69](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L69)

***

### response\_urls?

```ts
optional response_urls: ViewResponseUrl[];
```

Defined in: [src/types/view/index.ts:74](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L74)

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

Defined in: [src/types/view/index.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L53)

***

### token

```ts
token: string;
```

Defined in: [src/types/view/index.ts:66](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L66)

***

### trigger\_id

```ts
trigger_id: string;
```

Defined in: [src/types/view/index.ts:67](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L67)

***

### type

```ts
type: "view_submission";
```

Defined in: [src/types/view/index.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L52)

***

### user

```ts
user: object;
```

Defined in: [src/types/view/index.ts:59](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L59)

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

Defined in: [src/types/view/index.ts:64](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L64)
