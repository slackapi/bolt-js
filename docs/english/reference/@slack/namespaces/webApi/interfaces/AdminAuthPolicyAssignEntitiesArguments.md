[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminAuthPolicyAssignEntitiesArguments

# Interface: AdminAuthPolicyAssignEntitiesArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/auth.d.ts:14

## Extends

- `EntityIDs`.`EntityType`.`PolicyName`.`TokenOverridable`

## Properties

### entity\_ids

```ts
entity_ids: string[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/auth.d.ts:4

#### Description

Encoded IDs of the entities interacting with.

#### Inherited from

```ts
EntityIDs.entity_ids
```

***

### entity\_type

```ts
entity_type: "USER";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/auth.d.ts:8

#### Description

The type of entity interacting with the policy.

#### Inherited from

```ts
EntityType.entity_type
```

***

### policy\_name

```ts
policy_name: "email_password";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/auth.d.ts:12

#### Description

The name of the policy.

#### Inherited from

```ts
PolicyName.policy_name
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
