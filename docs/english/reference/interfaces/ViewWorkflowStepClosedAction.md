[@slack/bolt](../index.md) / ViewWorkflowStepClosedAction

# ~~Interface: ViewWorkflowStepClosedAction~~

Defined in: [src/types/view/index.ts:131](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L131)

A Slack view_closed step from app event

This describes the additional JSON-encoded body details for a step's view_closed event

## Deprecated

Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
version.

## Extends

- [`ViewClosedAction`](ViewClosedAction.md)

## Properties

### ~~api\_app\_id~~

```ts
api_app_id: string;
```

Defined in: [src/types/view/index.ts:96](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L96)

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`api_app_id`](ViewClosedAction.md#api_app_id)

***

### ~~enterprise?~~

```ts
optional enterprise: object;
```

Defined in: [src/types/view/index.ts:101](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L101)

#### ~~id~~

```ts
id: string;
```

#### ~~name~~

```ts
name: string;
```

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`enterprise`](ViewClosedAction.md#enterprise)

***

### ~~is\_cleared~~

```ts
is_cleared: boolean;
```

Defined in: [src/types/view/index.ts:98](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L98)

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`is_cleared`](ViewClosedAction.md#is_cleared)

***

### ~~is\_enterprise\_install?~~

```ts
optional is_enterprise_install: boolean;
```

Defined in: [src/types/view/index.ts:100](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L100)

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`is_enterprise_install`](ViewClosedAction.md#is_enterprise_install)

***

### ~~team~~

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

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`team`](ViewClosedAction.md#team)

***

### ~~token~~

```ts
token: string;
```

Defined in: [src/types/view/index.ts:97](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L97)

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`token`](ViewClosedAction.md#token)

***

### ~~type~~

```ts
type: "view_closed";
```

Defined in: [src/types/view/index.ts:83](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L83)

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`type`](ViewClosedAction.md#type)

***

### ~~user~~

```ts
user: object;
```

Defined in: [src/types/view/index.ts:90](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L90)

#### ~~id~~

```ts
id: string;
```

#### ~~name~~

```ts
name: string;
```

#### ~~team\_id?~~

```ts
optional team_id: string;
```

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`user`](ViewClosedAction.md#user)

***

### ~~view~~

```ts
view: ViewOutput;
```

Defined in: [src/types/view/index.ts:95](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L95)

#### Inherited from

[`ViewClosedAction`](ViewClosedAction.md).[`view`](ViewClosedAction.md#view)

***

### ~~workflow\_step~~

```ts
workflow_step: object;
```

Defined in: [src/types/view/index.ts:132](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L132)

#### ~~step\_id~~

```ts
step_id: string;
```

#### ~~workflow\_id~~

```ts
workflow_id: string;
```

#### ~~workflow\_step\_edit\_id~~

```ts
workflow_step_edit_id: string;
```
