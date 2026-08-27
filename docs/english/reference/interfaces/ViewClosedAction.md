---
sidebar_label: "ViewClosedAction"
---

[@slack/bolt](../index.md) / ViewClosedAction

# Interface: ViewClosedAction

Defined in: [src/types/view/index.ts:78](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L78)

A Slack view_closed event wrapped in the standard metadata.

This describes the entire JSON-encoded body of a view_closed event.

## Properties

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/view/index.ts:92](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L92)

***

### enterprise?

```ts
optional enterprise?: object;
```

Defined in: [src/types/view/index.ts:97](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L97)

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

Defined in: [src/types/view/index.ts:94](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L94)

***

### is\_enterprise\_install?

```ts
optional is_enterprise_install?: boolean;
```

Defined in: [src/types/view/index.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L96)

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

Defined in: [src/types/view/index.ts:80](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L80)

***

### token

```ts
token: string;
```

Defined in: [src/types/view/index.ts:93](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L93)

***

### type

```ts
type: "view_closed";
```

Defined in: [src/types/view/index.ts:79](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L79)

***

### user

```ts
user: object;
```

Defined in: [src/types/view/index.ts:86](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L86)

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

### view

```ts
view: ViewOutput;
```

Defined in: [src/types/view/index.ts:91](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L91)
