[@slack/bolt](../index.md) / WorkflowStep

# ~~Class: WorkflowStep~~

Defined in: [src/WorkflowStep.ts:174](https://github.com/slackapi/bolt-js/blob/main/src/WorkflowStep.ts#L174)

## Deprecated

Steps from Apps are no longer supported and support for them will be removed in the next major bolt-js
version.

## Constructors

### Constructor

```ts
new WorkflowStep(callbackId, config): WorkflowStep;
```

Defined in: [src/WorkflowStep.ts:187](https://github.com/slackapi/bolt-js/blob/main/src/WorkflowStep.ts#L187)

#### Parameters

##### callbackId

`string`

##### config

[`WorkflowStepConfig`](../interfaces/WorkflowStepConfig.md)

#### Returns

`WorkflowStep`

## Methods

### ~~getMiddleware()~~

```ts
getMiddleware(): Middleware<AnyMiddlewareArgs>;
```

Defined in: [src/WorkflowStep.ts:198](https://github.com/slackapi/bolt-js/blob/main/src/WorkflowStep.ts#L198)

#### Returns

[`Middleware`](../type-aliases/Middleware.md)\<[`AnyMiddlewareArgs`](../type-aliases/AnyMiddlewareArgs.md)\>
