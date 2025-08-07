[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CallsEndArguments

# Interface: CallsEndArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:43

## Extends

- `ID`.`TokenOverridable`

## Properties

### duration?

```ts
optional duration: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:45

#### Description

Call duration in seconds.

***

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
