[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsersInfoArguments

# Interface: UsersInfoArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:31

## Extends

- `TokenOverridable`.`LocaleAware`

## Properties

### include\_locale?

```ts
optional include_locale: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:44

#### Description

Set this to `true` to receive the locale with the response.

#### Inherited from

```ts
LocaleAware.include_locale
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

### user

```ts
user: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:33

#### Description

User to get info on.
