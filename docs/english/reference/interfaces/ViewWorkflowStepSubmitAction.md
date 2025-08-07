[@slack/bolt](../index.md) / ViewWorkflowStepSubmitAction

# ~~Interface: ViewWorkflowStepSubmitAction~~

Defined in: [src/types/view/index.ts:114](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L114)

A Slack view_submission step from app event

This describes the additional JSON-encoded body details for a step's view_submission event

## Deprecated

Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
version.

## Extends

- [`ViewSubmitAction`](ViewSubmitAction.md)

## Properties

### ~~api\_app\_id~~

```ts
api_app_id: string;
```

Defined in: [src/types/view/index.ts:65](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L65)

#### Inherited from

[`ViewSubmitAction`](ViewSubmitAction.md).[`api_app_id`](ViewSubmitAction.md#api_app_id)

***

### ~~enterprise?~~

```ts
optional enterprise: object;
```

Defined in: [src/types/view/index.ts:70](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L70)

#### ~~id~~

```ts
id: string;
```

#### ~~name~~

```ts
name: string;
```

#### Inherited from

[`ViewSubmitAction`](ViewSubmitAction.md).[`enterprise`](ViewSubmitAction.md#enterprise)

***

### ~~is\_enterprise\_install?~~

```ts
optional is_enterprise_install: boolean;
```

Defined in: [src/types/view/index.ts:69](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L69)

#### Inherited from

[`ViewSubmitAction`](ViewSubmitAction.md).[`is_enterprise_install`](ViewSubmitAction.md#is_enterprise_install)

***

### ~~response\_urls?~~

```ts
optional response_urls: ViewResponseUrl[];
```

Defined in: [src/types/view/index.ts:116](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L116)

#### Overrides

[`ViewSubmitAction`](ViewSubmitAction.md).[`response_urls`](ViewSubmitAction.md#response_urls)

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

Defined in: [src/types/view/index.ts:53](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L53)

#### Inherited from

[`ViewSubmitAction`](ViewSubmitAction.md).[`team`](ViewSubmitAction.md#team)

***

### ~~token~~

```ts
token: string;
```

Defined in: [src/types/view/index.ts:66](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L66)

#### Inherited from

[`ViewSubmitAction`](ViewSubmitAction.md).[`token`](ViewSubmitAction.md#token)

***

### ~~trigger\_id~~

```ts
trigger_id: string;
```

Defined in: [src/types/view/index.ts:115](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L115)

#### Overrides

[`ViewSubmitAction`](ViewSubmitAction.md).[`trigger_id`](ViewSubmitAction.md#trigger_id)

***

### ~~type~~

```ts
type: "view_submission";
```

Defined in: [src/types/view/index.ts:52](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L52)

#### Inherited from

[`ViewSubmitAction`](ViewSubmitAction.md).[`type`](ViewSubmitAction.md#type)

***

### ~~user~~

```ts
user: object;
```

Defined in: [src/types/view/index.ts:59](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L59)

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

[`ViewSubmitAction`](ViewSubmitAction.md).[`user`](ViewSubmitAction.md#user)

***

### ~~view~~

```ts
view: ViewOutput;
```

Defined in: [src/types/view/index.ts:64](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L64)

#### Inherited from

[`ViewSubmitAction`](ViewSubmitAction.md).[`view`](ViewSubmitAction.md#view)

***

### ~~workflow\_step~~

```ts
workflow_step: object;
```

Defined in: [src/types/view/index.ts:117](https://github.com/slackapi/bolt-js/blob/main/src/types/view/index.ts#L117)

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
