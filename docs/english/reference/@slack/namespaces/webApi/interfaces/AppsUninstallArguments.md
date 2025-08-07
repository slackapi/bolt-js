[@slack/bolt](../../../../index.md) / [webApi](../index.md) / AppsUninstallArguments

# Interface: AppsUninstallArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/apps.d.ts:21

## Extends

- `Pick`\<`OAuthCredentials`, `"client_id"` \| `"client_secret"`\>.`TokenOverridable`

## Properties

### client\_id

```ts
client_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:110

#### Description

Issued when you created your application.

#### Inherited from

[`OpenIDConnectTokenArguments`](OpenIDConnectTokenArguments.md).[`client_id`](OpenIDConnectTokenArguments.md#client_id)

***

### client\_secret

```ts
client_secret: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:112

#### Description

Issued when you created your application.

#### Inherited from

[`OpenIDConnectTokenArguments`](OpenIDConnectTokenArguments.md).[`client_secret`](OpenIDConnectTokenArguments.md#client_secret)

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
