[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsersSetPresenceArguments

# Interface: UsersSetPresenceArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:49

## Extends

- `TokenOverridable`

## Properties

### presence

```ts
presence: "auto" | "away";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:51

#### Description

Either `auto` or `away`.

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
