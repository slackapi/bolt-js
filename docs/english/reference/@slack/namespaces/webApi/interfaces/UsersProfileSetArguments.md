[@slack/bolt](../../../../index.md) / [webApi](../index.md) / UsersProfileSetArguments

# Interface: UsersProfileSetArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:62

## Extends

- `TokenOverridable`

## Properties

### name?

```ts
optional name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:76

#### Description

Name of a single profile field to set. If both `name` and `profile` are set, `name` takes precedence.

#### See

[\`users.profile.set\` Profile fields usage info](https://api.slack.com/methods/users.profile.set#profile-fields).

***

### profile?

```ts
optional profile: Record<string, unknown>;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:69

#### Description

Sets profile fields using a single argument.
Collection of key:value pairs presented.
At most 50 fields may be set. Each field name is limited to 255 characters.

#### See

[\`users.profile.set\` Profile fields usage info](https://api.slack.com/methods/users.profile.set#profile-fields).

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

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:71

#### Description

ID of user to change. This argument may only be specified by admins on paid teams.

***

### value?

```ts
optional value: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/users.d.ts:81

#### Description

Value to set for the profile field specified by `name`. Usable only if profile is not passed.

#### See

[\`users.profile.set\` Profile fields usage info](https://api.slack.com/methods/users.profile.set#profile-fields).
