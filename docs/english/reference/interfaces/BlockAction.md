[@slack/bolt](../index.md) / BlockAction

# Interface: BlockAction\<ElementAction\>

Defined in: [src/types/actions/block-action.ts:230](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L230)

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

Defined in: [src/types/actions/block-action.ts:232](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L232)

***

### api\_app\_id

```ts
api_app_id: string;
```

Defined in: [src/types/actions/block-action.ts:272](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L272)

***

### app\_unfurl?

```ts
optional app_unfurl: any;
```

Defined in: [src/types/actions/block-action.ts:278](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L278)

***

### bot\_access\_token?

```ts
optional bot_access_token: string;
```

Defined in: [src/types/actions/block-action.ts:292](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L292)

An expiring token generated for the context of a workflow step.

#### See

[https://docs.slack.dev/authentication/tokens/#wfb](https://docs.slack.dev/authentication/tokens/#wfb)

***

### channel?

```ts
optional channel: object;
```

Defined in: [src/types/actions/block-action.ts:248](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L248)

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

Defined in: [src/types/actions/block-action.ts:275](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L275)

***

### enterprise?

```ts
optional enterprise: object;
```

Defined in: [src/types/actions/block-action.ts:282](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L282)

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
optional function_data: object;
```

Defined in: [src/types/actions/block-action.ts:298](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L298)

Information about the executed step.

#### execution\_id

```ts
execution_id: string;
```

A unique ID for the step being executed.

##### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://tools.slack.dev/bolt-js/concepts/custom-steps/](https://tools.slack.dev/bolt-js/concepts/custom-steps/)

#### function

```ts
function: object;
```

Details about the step.

##### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://tools.slack.dev/bolt-js/concepts/custom-steps/](https://tools.slack.dev/bolt-js/concepts/custom-steps/)

##### function.callback\_id

```ts
callback_id: string;
```

The unique callback ID of the step.

###### See

 - [https://docs.slack.dev/workflows/workflow-steps/#create](https://docs.slack.dev/workflows/workflow-steps/#create)
 - [https://tools.slack.dev/bolt-js/concepts/custom-steps/](https://tools.slack.dev/bolt-js/concepts/custom-steps/)

#### inputs

```ts
inputs: FunctionInputs;
```

Values of input parameters for the executed step.

##### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://tools.slack.dev/bolt-js/concepts/custom-steps/](https://tools.slack.dev/bolt-js/concepts/custom-steps/)
 - [https://tools.slack.dev/bolt-js/tutorials/custom-steps#inputs-outputs](https://tools.slack.dev/bolt-js/tutorials/custom-steps#inputs-outputs)

#### See

 - [https://docs.slack.dev/workflows/workflow-steps/](https://docs.slack.dev/workflows/workflow-steps/)
 - [https://tools.slack.dev/bolt-js/concepts/custom-steps/](https://tools.slack.dev/bolt-js/concepts/custom-steps/)

***

### is\_enterprise\_install?

```ts
optional is_enterprise_install: boolean;
```

Defined in: [src/types/actions/block-action.ts:281](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L281)

***

### message?

```ts
optional message: object;
```

Defined in: [src/types/actions/block-action.ts:253](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L253)

#### Index Signature

```ts
[key: string]: any
```

#### text?

```ts
optional text: string;
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
optional user: string;
```

***

### response\_url

```ts
response_url: string;
```

Defined in: [src/types/actions/block-action.ts:270](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L270)

***

### state?

```ts
optional state: object;
```

Defined in: [src/types/actions/block-action.ts:262](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L262)

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
  | null
  | {
  domain: string;
  enterprise_id?: string;
  enterprise_name?: string;
  id: string;
};
```

Defined in: [src/types/actions/block-action.ts:233](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L233)

***

### token

```ts
token: string;
```

Defined in: [src/types/actions/block-action.ts:269](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L269)

***

### trigger\_id

```ts
trigger_id: string;
```

Defined in: [src/types/actions/block-action.ts:271](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L271)

***

### type

```ts
type: "block_actions";
```

Defined in: [src/types/actions/block-action.ts:231](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L231)

***

### user

```ts
user: object;
```

Defined in: [src/types/actions/block-action.ts:239](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L239)

#### id

```ts
id: string;
```

#### name?

```ts
optional name: string;
```

name will be present if the block_action originates from the Home tab

#### team\_id?

```ts
optional team_id: string;
```

#### username

```ts
username: string;
```

***

### view?

```ts
optional view: ViewOutput;
```

Defined in: [src/types/actions/block-action.ts:261](https://github.com/slackapi/bolt-js/blob/main/src/types/actions/block-action.ts#L261)
