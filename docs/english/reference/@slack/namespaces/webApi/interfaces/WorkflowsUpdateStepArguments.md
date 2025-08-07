[@slack/bolt](../../../../index.md) / [webApi](../index.md) / WorkflowsUpdateStepArguments

# Interface: WorkflowsUpdateStepArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/workflows.d.ts:12

## Extends

- `TokenOverridable`

## Properties

### inputs?

```ts
optional inputs: object;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/workflows.d.ts:16

#### Index Signature

```ts
[name: string]: object
```

***

### outputs?

```ts
optional outputs: object[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/workflows.d.ts:25

#### label

```ts
label: string;
```

#### name

```ts
name: string;
```

#### type

```ts
type: string;
```

***

### step\_image\_url?

```ts
optional step_image_url: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/workflows.d.ts:14

***

### step\_name?

```ts
optional step_name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/workflows.d.ts:15

***

### token?

```ts
optional token: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:37

#### Description

Overridable authentication token bearing required scopes.

#### Inherited from

```ts
TokenOverridable.token
```

***

### workflow\_step\_edit\_id

```ts
workflow_step_edit_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/workflows.d.ts:13
