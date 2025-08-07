[@slack/bolt](../../../../index.md) / [webApi](../index.md) / OpenIDConnectTokenArguments

# Interface: OpenIDConnectTokenArguments

Defined in: node\_modules/@slack/web-api/dist/types/request/openid.d.ts:3

## Extends

- `OAuthCredentials`.`OAuthGrantRefresh`

## Properties

### client\_id

```ts
client_id: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:110

#### Description

Issued when you created your application.

#### Inherited from

```ts
OAuthCredentials.client_id
```

***

### client\_secret

```ts
client_secret: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:112

#### Description

Issued when you created your application.

#### Inherited from

```ts
OAuthCredentials.client_secret
```

***

### code?

```ts
optional code: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:114

#### Description

The `code` parameter returned via the OAuth callback.

#### Inherited from

```ts
OAuthCredentials.code
```

***

### grant\_type?

```ts
optional grant_type: "authorization_code" | "refresh_token";
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:123

#### Description

The `grant_type` param as described in the OAuth spec.

#### Inherited from

```ts
OAuthGrantRefresh.grant_type
```

***

### redirect\_uri?

```ts
optional redirect_uri: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:119

#### Description

While optional, it is _required_ if your app passed it as a parameter to the OpenID/OAuth flow's
first step and must match the originally submitted URI.

#### Inherited from

```ts
OAuthCredentials.redirect_uri
```

***

### refresh\_token?

```ts
optional refresh_token: string;
```

Defined in: node\_modules/@slack/web-api/dist/types/request/common.d.ts:125

#### Description

The `refresh_token` param as described in the OAuth spec.

#### Inherited from

```ts
OAuthGrantRefresh.refresh_token
```
