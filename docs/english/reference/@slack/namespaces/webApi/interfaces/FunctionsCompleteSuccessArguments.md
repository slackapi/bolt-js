[@slack/bolt](../../../../index.md) / [webApi](../index.md) / FunctionsCompleteSuccessArguments

# Interface: FunctionsCompleteSuccessArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/functions.d.ts:8

## Extends

- `ExecutionID`.`TokenOverridable`

## Properties

### function\_execution\_id

```ts
function_execution_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/functions.d.ts:3

#### Inherited from

```ts
ExecutionID.function_execution_id
```

***

### outputs

```ts
outputs: Record<string, unknown>;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/functions.d.ts:9

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
