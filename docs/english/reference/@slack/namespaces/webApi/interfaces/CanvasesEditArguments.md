[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CanvasesEditArguments

# Interface: CanvasesEditArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:67

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

### changes

```ts
changes: [Change, ...Change[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/canvas.d.ts:69

#### Description

List of changes to apply to the canvas.

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
