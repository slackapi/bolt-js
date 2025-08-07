[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsersProfileGetArguments

# Interface: UsersProfileGetArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:53

## Extends

- `TokenOverridable`

## Properties

### include\_labels?

```ts
optional include_labels: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:58

#### Description

Include labels for each ID in custom profile fields.
Using this parameter will heavily rate-limit your requests and is not recommended. Defaults to `false`.

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

### user?

```ts
optional user: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:60

#### Description

User to retrieve profile info for.
