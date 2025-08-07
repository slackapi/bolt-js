[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminBarriersCreateArguments

# Interface: AdminBarriersCreateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/barriers.d.ts:7

## Extends

- `TokenOverridable`

## Extended by

- [`AdminBarriersUpdateArguments`](AdminBarriersUpdateArguments.md)

## Properties

### barriered\_from\_usergroup\_ids

```ts
barriered_from_usergroup_ids: string[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/barriers.d.ts:9

#### Description

A list of [IDP Groups](https://slack.com/help/articles/115001435788-Connect-identity-provider-groups-to-your-Enterprise-Grid-org) IDs ti associate with the barrier.

***

### primary\_usergroup\_id

```ts
primary_usergroup_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/barriers.d.ts:11

#### Description

The ID of the primary [IDP Group](https://slack.com/help/articles/115001435788-Connect-identity-provider-groups-to-your-Enterprise-Grid-org).

***

### restricted\_subjects

```ts
restricted_subjects: ["im", "mpim", "call"];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/barriers.d.ts:16

#### Description

What kind of interactions are blocked by this barrier?
Currently you must provide all three: `im`, `mpim`, `call`.

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
