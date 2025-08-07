[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminWorkflowsCollaboratorsRemoveArguments

# Interface: AdminWorkflowsCollaboratorsRemoveArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/workflows.d.ts:13

## Extends

- `CollaboratorIDs`.`WorkflowIDs`.`TokenOverridable`

## Properties

### collaborator\_ids

```ts
collaborator_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/workflows.d.ts:5

#### Description

Array of collaborators (encoded user IDs) - maximum of 50 items.

#### Inherited from

```ts
CollaboratorIDs.collaborator_ids
```

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
