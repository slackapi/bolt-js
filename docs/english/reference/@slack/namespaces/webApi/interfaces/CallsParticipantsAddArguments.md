[@slack/bolt](../../../../index.md) / [webApi](../index.md) / CallsParticipantsAddArguments

# Interface: CallsParticipantsAddArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:51

## Extends

- `ID`.`Users`.`TokenOverridable`

## Properties

### id

```ts
id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:5

#### Description

`id` returned when registering the call using the `calls.add` method.

#### Inherited from

```ts
ID.id
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

### users

```ts
users: CallUser[];
```

Defined in: node\_modules/@slack/web-api/dist/types/request/calls.d.ts:12

#### Description

The list of users to add/remove to/from the Call.

#### See

[Using the Calls API: a note on Users](https://api.slack.com/apis/calls#users).

#### Inherited from

```ts
Users.users
```
