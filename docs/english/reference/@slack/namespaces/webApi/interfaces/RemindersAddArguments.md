[@slack/bolt](../../../../index.md) / [webApi](../index.md) / RemindersAddArguments

# Interface: RemindersAddArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/reminders.d.ts:15

## Extends

- `TokenOverridable`.`OptionalTeamAssignable`

## Properties

### recurrence?

```ts
optional recurrence: ReminderRecurrence;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/reminders.d.ts:35

#### Description

Specify the repeating behavior of a reminder. If you set the sub-property `frequency` to `weekly`,
you must also set the `weekdays` array to specify which days of the week to recur on.

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

### text

```ts
text: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/reminders.d.ts:17

#### Description

The content of the reminder.

***

### time

```ts
time: string | number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/reminders.d.ts:24

#### Description

When this reminder should happen, one of:
- the Unix timestamp (up to five years from now),
- the number of seconds until the reminder (if within 24 hours), or
- a natural language description (Ex. "in 15 minutes," or "every Thursday").

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

### ~~user?~~

```ts
optional user: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/reminders.d.ts:30

#### Description

No longer supported - reminders cannot be set for other users.

#### Deprecated

#### See

[Changes to \`reminders.\*\` APIs announcement](https://api.slack.com/changelog/2023-07-its-later-already-for-stars-and-reminders#what).
