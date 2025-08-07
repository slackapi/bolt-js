[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AdminUsersSessionSetSettingsArguments

# Interface: AdminUsersSessionSetSettingsArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:84

## Extends

- `UserIDs`.`TokenOverridable`

## Properties

### desktop\_app\_browser\_quit?

```ts
optional desktop_app_browser_quit: boolean;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:86

#### Description

Terminate the session when the client—either the desktop app or a browser window—is closed.

***

### duration?

```ts
optional duration: number;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/admin/users.d.ts:91

#### Description

The session duration in seconds. The minimum value is 28800, which represents 8 hours;
the max value is 315569520 or 10 years (that's a long Slack session).

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
