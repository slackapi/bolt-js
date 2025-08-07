[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CallsInfoArguments

# Interface: CallsInfoArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:47

## Extends

- `ID`.`TokenOverridable`

## Properties

### id

```ts
id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:5

#### Description

`id` returned when registering the call using the `calls.add` method.

#### Inherited from

```ts
ID.id
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
