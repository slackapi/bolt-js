[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CanvasesSectionsLookupArguments

# Interface: CanvasesSectionsLookupArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:61

## Extends

- `CanvasID`.`TokenOverridable`

## Properties

### canvas\_id

```ts
canvas_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:5

#### Description

Encoded ID of the canvas.

#### Inherited from

```ts
CanvasID.canvas_id
```

***

### criteria

```ts
criteria: Criteria;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:63

#### Description

Filtering criteria.

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
