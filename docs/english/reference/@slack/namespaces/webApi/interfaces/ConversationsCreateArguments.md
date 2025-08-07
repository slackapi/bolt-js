[@slack/bolt](../../../../index.md) / [webApi](../index.md) / ConversationsCreateArguments

# Interface: ConversationsCreateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:56

## Extends

- `IsPrivate`.`TokenOverridable`.`OptionalTeamAssignable`

## Properties

### is\_private?

```ts
optional is_private: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:22

#### Description

Whether the channel should be private.

#### Inherited from

```ts
IsPrivate.is_private
```

***

### name

```ts
name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/conversations.d.ts:58

#### Description

Name of the public or private channel to create.

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
