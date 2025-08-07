[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminFunctionsPermissionsLookupArguments

# Interface: AdminFunctionsPermissionsLookupArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:8

## Extends

- `TokenOverridable`

## Properties

### function\_ids

```ts
function_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/functions.d.ts:10

#### Description

An array of function IDs to get permissions for.

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
