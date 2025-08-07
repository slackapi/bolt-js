[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminWorkflowsPermissionsLookupArguments

# Interface: AdminWorkflowsPermissionsLookupArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/workflows.d.ts:15

## Extends

- `WorkflowIDs`.`TokenOverridable`

## Properties

### max\_workflow\_triggers?

```ts
optional max_workflow_triggers: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/workflows.d.ts:20

#### Description

Maximum number of triggers to fetch for each workflow when determining overall run permissions.
Defaults to `100`. Maximum of `1000`.

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

### workflow\_ids

```ts
workflow_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/workflows.d.ts:9

#### Description

Array of workflow IDs - maximum of 50 items.

#### Inherited from

```ts
WorkflowIDs.workflow_ids
```
