# BlockAction\<ElementAction\>

Defined in: [src/types/actions/block-action.ts:249](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L249)

A Slack Block Kit element action wrapped in the standard metadata.

This describes the entire JSON-encoded body of a request from Slack's Block Kit interactive components.

## Type Parameters

### ElementAction

`ElementAction` *extends* [`BasicElementAction`](BasicElementAction.md) = [`BlockElementAction`](../type-aliases/BlockElementAction.md)

## Properties

### actions

```ts
actions: ElementAction[];
```

Defined in: [src/types/actions/block-action.ts:251](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L251)

***

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/actions/block-action.ts:291](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L291)

***

### app\_unfurl?

```ts
optional app_unfurl?: any;
```

Defined in: [src/types/actions/block-action.ts:297](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L297)

***

### bot\_access\_token?

```ts
optional bot_access_token?: string;
```

Defined in: [src/types/actions/block-action.ts:311](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L311)

An expiring token generated for the context of a workflow step.

#### See

[https://docs.slack.dev/authentication/tokens/#wfb](https://docs.slack.dev/authentication/tokens/#wfb)

***

### channel?

```ts
optional channel?: object;
```

Defined in: [src/types/actions/block-action.ts:267](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L267)

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

Defined in: [src/types/actions/block-action.ts:294](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L294)

***

### enterprise?

```ts
optional enterprise?: object;
```

Defined in: [src/types/actions/block-action.ts:301](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L301)

#### id

```ts
id: string;
```

#### name

```ts
name: string;
```

***

### function\_data?

```ts
optional function_data?: object;
```

Defined in: [src/types/actions/block-action.ts:317](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L317)

Information about the executed step.

#### execution\_id

```ts
execution_id: string;
```

A unique ID for the step being executed.

##### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/)

#### function

```ts
function: object;
```

Details about the step.

##### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/)

##### function.callback\_id

```ts
callback_id: string;
```

The unique callback ID of the step.

###### See

 - [https://docs.slack.dev/workflows/workflow-steps/#create](https://docs.slack.dev/workflows/workflow-steps/#create)
 - [https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/)

#### inputs

```ts
inputs: FunctionInputs;
```

Values of input parameters for the executed step.

##### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/)
 - [https://docs.slack.dev/tools/bolt-js/tutorials/custom-steps/#inputs-outputs](https://docs.slack.dev/tools/bolt-js/tutorials/custom-steps/#inputs-outputs)

#### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/](https://docs.slack.dev/tools/bolt-js/concepts/custom-steps/)

***

### is\_enterprise\_install?

```ts
optional is_enterprise_install?: boolean;
```

Defined in: [src/types/actions/block-action.ts:300](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L300)

***

### message?

```ts
optional message?: object;
```

Defined in: [src/types/actions/block-action.ts:272](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L272)

#### Index Signature

```ts
[key: string]: any
```

#### text?

```ts
optional text?: string;
```

#### ts

```ts
ts: string;
```

#### type

```ts
type: "message";
```

#### user?

```ts
optional user?: string;
```

***

### response\_url

```ts
response_url: string;
```

Defined in: [src/types/actions/block-action.ts:289](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L289)

***

### state?

```ts
optional state?: object;
```

Defined in: [src/types/actions/block-action.ts:281](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L281)

#### values

```ts
values: object;
```

##### Index Signature

```ts
[blockId: string]: object
```

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

Defined in: [src/types/actions/block-action.ts:252](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L252)

***

### token

```ts
token: string;
```

Defined in: [src/types/actions/block-action.ts:288](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L288)

***

### trigger\_id

```ts
trigger_id: string;
```

Defined in: [src/types/actions/block-action.ts:290](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L290)

***

### type

```ts
type: "block_actions";
```

Defined in: [src/types/actions/block-action.ts:250](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L250)

***

### user

```ts
user: object;
```

Defined in: [src/types/actions/block-action.ts:258](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L258)

#### id

```ts
id: string;
```

#### name?

```ts
optional name?: string;
```

name will be present if the block_action originates from the Home tab

#### team\_id?

```ts
optional team_id?: string;
```

#### username

```ts
username: string;
```

***

### view?

```ts
optional view?: ViewOutput;
```

Defined in: [src/types/actions/block-action.ts:280](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L280)
