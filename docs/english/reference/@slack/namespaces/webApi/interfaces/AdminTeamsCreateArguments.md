[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminTeamsCreateArguments

# Interface: AdminTeamsCreateArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:6

## Extends

- `TokenOverridable`

## Properties

### team\_description?

```ts
optional team_description: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:12

#### Description

Description for the team.

***

### team\_discoverability?

```ts
optional team_discoverability: TeamDiscoverability;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:14

#### Description

Who can join the team.

***

### team\_domain

```ts
team_domain: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:8

#### Description

Team domain (for example, slacksoftballteam). Domains are limited to 21 characters.

***

### team\_name

```ts
team_name: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/teams.d.ts:10

#### Description

Team name (for example, Slack Softball Team).

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
