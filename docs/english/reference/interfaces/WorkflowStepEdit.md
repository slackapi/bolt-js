[@slack/bolt](../index.md) / WorkflowStepEdit

# ~~Interface: WorkflowStepEdit~~

Defined in: [src/types/actions/workflow-step-edit.ts:8](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L8)

A Slack step from app action wrapped in the standard metadata.

This describes the entire JSON-encoded body of a request from Slack step from app actions.

## Deprecated

Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
version.

## Properties

### ~~action\_ts~~

```ts
action_ts: string;
```

Defined in: [src/types/actions/workflow-step-edit.ts:28](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L28)

***

### ~~callback\_id~~

```ts
callback_id: string;
```

Defined in: [src/types/actions/workflow-step-edit.ts:10](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L10)

***

### ~~channel?~~

```ts
optional channel: object;
```

Defined in: [src/types/actions/workflow-step-edit.ts:23](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L23)

#### ~~id?~~

```ts
optional id: string;
```

#### ~~name?~~

```ts
optional name: string;
```

***

### ~~enterprise?~~

```ts
optional enterprise: object;
```

Defined in: [src/types/actions/workflow-step-edit.ts:50](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L50)

#### ~~id~~

```ts
id: string;
```

#### ~~name~~

```ts
name: string;
```

***

### ~~is\_enterprise\_install?~~

```ts
optional is_enterprise_install: boolean;
```

Defined in: [src/types/actions/workflow-step-edit.ts:49](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L49)

***

### ~~team~~

```ts
team: object;
```

Defined in: [src/types/actions/workflow-step-edit.ts:17](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L17)

#### ~~domain~~

```ts
domain: string;
```

#### ~~enterprise\_id?~~

```ts
optional enterprise_id: string;
```

#### ~~enterprise\_name?~~

```ts
optional enterprise_name: string;
```

#### ~~id~~

```ts
id: string;
```

***

### ~~token~~

```ts
token: string;
```

Defined in: [src/types/actions/workflow-step-edit.ts:27](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L27)

***

### ~~trigger\_id~~

```ts
trigger_id: string;
```

Defined in: [src/types/actions/workflow-step-edit.ts:11](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L11)

***

### ~~type~~

```ts
type: "workflow_step_edit";
```

Defined in: [src/types/actions/workflow-step-edit.ts:9](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L9)

***

### ~~user~~

```ts
user: object;
```

Defined in: [src/types/actions/workflow-step-edit.ts:12](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L12)

#### ~~id~~

```ts
id: string;
```

#### ~~team\_id?~~

```ts
optional team_id: string;
```

#### ~~username~~

```ts
username: string;
```

***

### ~~workflow\_step~~

```ts
workflow_step: object;
```

Defined in: [src/types/actions/workflow-step-edit.ts:29](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/workflow-step-edit.ts#L29)

#### ~~inputs~~

```ts
inputs: Record<string, {
  value: any;
}>;
```

#### ~~outputs~~

```ts
outputs: object[];
```

#### ~~step\_id~~

```ts
step_id: string;
```

#### ~~step\_image\_url?~~

```ts
optional step_image_url: string;
```

#### ~~step\_name?~~

```ts
optional step_name: string;
```

#### ~~workflow\_id~~

```ts
workflow_id: string;
```
