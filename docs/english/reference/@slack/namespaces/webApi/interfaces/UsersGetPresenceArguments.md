[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsersGetPresenceArguments

# Interface: UsersGetPresenceArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:25

## Extends

- `TokenOverridable`

## Properties

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

### user?

```ts
optional user: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:27

#### Description

User to get presence info on. Defaults to the authed user.
