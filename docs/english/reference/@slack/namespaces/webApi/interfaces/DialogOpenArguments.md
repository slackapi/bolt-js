[@slack/bolt](../../../../index.md) / [webApi](../index.md) / DialogOpenArguments

# Interface: DialogOpenArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/dialog.d.ts:3

## Extends

- `TokenOverridable`

## Properties

### dialog

```ts
dialog: Dialog;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/dialog.d.ts:7

#### Description

The dialog definition.

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

### trigger\_id

```ts
trigger_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/dialog.d.ts:5

#### Description

Exchange a trigger to post to the user.
