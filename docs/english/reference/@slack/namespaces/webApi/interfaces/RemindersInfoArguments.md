[@slack/bolt](../../../../index.md) / [webApi](../index.md) / RemindersInfoArguments

# Interface: RemindersInfoArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/reminders.d.ts:45

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`

## Properties

### reminder

```ts
reminder: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/reminders.d.ts:47

#### Description

The ID of the reminder to retrieve information about.

***

### team\_id?

```ts
optional team_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:60

#### Description

If using an org token, `team_id` is required.

#### Inherited from

```ts
OptionalTeamAssignable.team_id
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
