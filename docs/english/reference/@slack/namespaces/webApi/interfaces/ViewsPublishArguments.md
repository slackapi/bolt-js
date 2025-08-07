[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ViewsPublishArguments

# Interface: ViewsPublishArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/views.d.ts:30

## Extends

- `BaseViewsArguments`.`TokenOverridable`.`ViewHash`

## Properties

### hash?

```ts
optional hash: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/views.d.ts:28

#### Description

A string that represents view state to protect against possible race conditions.

#### See

[Avoiding race conditions when using views](https://api.slack.com/surfaces/modals#handling_race_conditions).

#### Inherited from

```ts
ViewHash.hash
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

### user\_id

```ts
user_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/views.d.ts:32

#### Description

ID of the user you want publish a view to.

***

### view

```ts
view: View;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/views.d.ts:5

#### Description

A [view payload](https://api.slack.com/reference/surfaces/views).

#### Inherited from

```ts
BaseViewsArguments.view
```
