[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminRolesAddAssignmentsArguments

# Interface: AdminRolesAddAssignmentsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/roles.d.ts:17

## Extends

- `EntityIDs`.`RoleID`.`UserIDs`.`TokenOverridable`

## Properties

### entity\_ids

```ts
entity_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/roles.d.ts:8

#### Description

List of the entity IDs for which roles will be assigned/listed/removed.
These can be Org IDs (E12345), Team IDs (T12345) or Channel IDs (C12345).

#### Inherited from

```ts
EntityIDs.entity_ids
```

***

### role\_id

```ts
role_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/roles.d.ts:15

#### Description

ID of the role to which users will be assigned/removed.

#### See

[Admin Roles under Usage info](https://api.slack.com/methods/admin.roles.addAssignments#markdown).

#### Inherited from

```ts
RoleID.role_id
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

### user\_ids

```ts
user_ids: [string, ...string[]];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:76

#### Description

List of encoded user IDs.

#### Inherited from

```ts
UserIDs.user_ids
```
